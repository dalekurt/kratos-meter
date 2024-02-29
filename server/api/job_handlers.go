// server/api/job_handlers.go
package api

import (
	"context"
	"github.com/dalekurt/kratos-meter/server/models"
	"github.com/dalekurt/kratos-meter/server/shared"
	"github.com/dalekurt/kratos-meter/server/utils"
	"github.com/dalekurt/kratos-meter/server/workflows"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.temporal.io/sdk/client"
	"log"
	"net/http"
	"time"
)

// CreateJob creates a new job and saves it to MongoDB
func (hd *HandlerDependencies) CreateJob(c *gin.Context) {
	var job models.Job

	if err := c.BindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var project models.Project
	if err := hd.ProjectsCollection.FindOne(context.Background(), bson.M{"projectId": job.ProjectID}).Decode(&project); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve project"})
		}
		return
	}

	job.ID = utils.GenerateUniqueID()
	job.CreatedAt = time.Now()

	if _, err := hd.JobsCollection.InsertOne(context.Background(), job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job in the database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Job created successfully", "jobID": job.ID})
}

// GetJobs returns all jobs from the database
func (hd *HandlerDependencies) GetJobs(c *gin.Context) {
	var jobs []models.Job
	cursor, err := hd.JobsCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve jobs"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var job models.Job
		if err := cursor.Decode(&job); err != nil {
			continue // Log the error but don't break
		}
		jobs = append(jobs, job)
	}

	if err := cursor.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve jobs"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

// GetJobByID returns a specific job by its ID from the database
func (hd *HandlerDependencies) GetJobByID(c *gin.Context) {
	jobID := c.Param("id")

	var job models.Job
	if err := hd.JobsCollection.FindOne(context.Background(), bson.M{"id": jobID}).Decode(&job); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve job"})
		}
		return
	}

	c.JSON(http.StatusOK, job)
}

// StartJob starts the workflow for a given job ID
func (hd *HandlerDependencies) StartJob(c *gin.Context) {
	jobID := c.Param("jobid")

	var job models.Job
	if err := hd.JobsCollection.FindOne(context.Background(), bson.M{"id": jobID}).Decode(&job); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve job"})
		}
		return
	}

	jobDetails := shared.JobDetails{
		ID:          job.ID,
		Name:        job.Name,
		Description: job.Description,
		Filename:    job.Filename,
		GitRepo:     job.GitRepo,
		// ScreenshotEnabled: job.ScreenshotEnabled,
		GitBranch: job.GitBranch,
	}

	// Use TemporalClientWrapper to execute the workflow
	we, err := hd.TemporalClientWrapper.TemporalClient.ExecuteWorkflow(context.Background(), client.StartWorkflowOptions{
		// ID:        "loadTestJob_" + job.ID,
		ID:        job.ID,
		TaskQueue: "kratosMeterTaskQueue",
	}, workflows.LoadTestWorkflow, jobDetails)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start load test workflow"})
		return
	}

	// Asynchronously call UpdateWorkflowStatus to listen for workflow status updates
	go hd.TemporalClientWrapper.UpdateWorkflowStatus(we.GetID())

	c.JSON(http.StatusOK, gin.H{
		"message":    "Workflow started for job",
		"jobID":      job.ID,
		"workflowID": we.GetID(),
		"runID":      we.GetRunID(),
	})
}

// UpdateJobStatusAndLog updates the status of a job and logs the change in the JobLogsCollection
func (hd *HandlerDependencies) UpdateJobStatusAndLog(jobID, status, message string) error {
	ctx := context.Background()

	// Update job status
	update := bson.M{"$set": bson.M{"status": status}}
	_, err := hd.JobsCollection.UpdateOne(ctx, bson.M{"id": jobID}, update)
	if err != nil {
		log.Printf("Error updating job status: %v", err)
		return err
	}

	// Log status change
	jobLog := models.JobLog{
		JobID:     jobID,
		Status:    status,
		Timestamp: time.Now(),
		Message:   message,
	}
	_, err = hd.JobLogsCollection.InsertOne(ctx, jobLog)
	if err != nil {
		log.Printf("Error inserting job log: %v", err)
		return err
	}

	return nil
}

// GetJobsByProjectID handles the request to get jobs by project ID
func (hd *HandlerDependencies) GetJobsByProjectID(c *gin.Context) {
	projectID := c.Param("id")
	log.Printf("Fetching jobs for project ID: %s", projectID)

	// Use projectID to filter jobs
	filter := bson.M{"projectId": projectID}
	var jobs []models.Job

	cursor, err := hd.JobsCollection.Find(context.Background(), filter)
	if err != nil {
		log.Printf("Error fetching jobs: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve jobs for the project"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var job models.Job
		if err := cursor.Decode(&job); err != nil {
			log.Printf("Error decoding job data: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode job data"})
			return
		}
		jobs = append(jobs, job)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cursor error while retrieving jobs"})
		return
	}

	log.Printf("Jobs found: %v", jobs)
	c.JSON(http.StatusOK, jobs)
}
