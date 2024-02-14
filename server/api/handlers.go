// server/api/handlers.go
package api

import (
	"context"
	"net/http"

	"github.com/dalekurt/kratos-meter/server/models"
	"github.com/dalekurt/kratos-meter/server/shared"
	"github.com/dalekurt/kratos-meter/server/utils"
	"github.com/dalekurt/kratos-meter/server/workflows"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.temporal.io/sdk/client"
	"log"
)

// HandlerDependencies struct to hold dependencies for the handlers
type HandlerDependencies struct {
	TemporalClient  client.Client
	MongoCollection *mongo.Collection
}

// CreateJob creates a new job, saves it to MongoDB, and starts a Temporal workflow
func (hd *HandlerDependencies) CreateJob(c *gin.Context) {
	var job models.Job

	if err := c.BindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job.ID = utils.GenerateUniqueID()
	job.Status = "Pending"

	_, err := hd.MongoCollection.InsertOne(context.Background(), job)
	if err != nil {
		log.Printf("Failed to insert job into MongoDB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job in the database"})
		return
	}

	// Convert models.Job to workflows.JobDetails
	jobDetails := shared.JobDetails{
		ID:          job.ID,
		Name:        job.Name,
		Description: job.Description,
		Filename:    job.Filename,
		GitRepo:     job.GitRepo,
		GitBranch:   job.GitBranch,
	}

	we, err := hd.TemporalClient.ExecuteWorkflow(context.Background(), client.StartWorkflowOptions{
		ID:        "loadTestJob_" + job.ID,
		TaskQueue: "kratosMeterTaskQueue",
	}, workflows.LoadTestWorkflow, jobDetails)
	if err != nil {
		log.Printf("Failed to start load test workflow: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start load test workflow"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"message":    "Job created and workflow started",
		"jobID":      job.ID,
		"workflowID": we.GetID(),
		"runID":      we.GetRunID(),
	})
}

// GetJobs returns all jobs from the database
func (hd *HandlerDependencies) GetJobs(c *gin.Context) {
	var jobs []models.Job
	cursor, err := hd.MongoCollection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Printf("Failed to retrieve jobs from MongoDB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve jobs"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var job models.Job
		if err := cursor.Decode(&job); err != nil {
			log.Printf("Failed to decode job from MongoDB: %v", err)
			continue
		}
		jobs = append(jobs, job)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error when retrieving jobs from MongoDB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve jobs"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

// GetJobByID returns a specific job by its ID from the database
func (hd *HandlerDependencies) GetJobByID(c *gin.Context) {
	jobID := c.Param("id")

	var job models.Job
	if err := hd.MongoCollection.FindOne(context.Background(), bson.M{"id": jobID}).Decode(&job); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		} else {
			log.Printf("Failed to retrieve job from MongoDB: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve job"})
		}
		return
	}

	c.JSON(http.StatusOK, job)
}
