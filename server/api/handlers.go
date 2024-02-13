// server/api/handlers.go
package api

import (
	"context"
	"github.com/dalekurt/kratos-meter/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.temporal.io/sdk/client"
	"net/http"
)

func CreateJob(mongoCollection *mongo.Collection, temporalClient client.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var job models.Job
		if err := c.BindJSON(&job); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Generate unique ID and set initial status
		job.ID = generateUniqueID() // TODO: Implement this function
		job.Status = "Pending"

		// Insert job into MongoDB
		_, err := mongoCollection.InsertOne(context.Background(), job)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job in the database"})
			return
		}

		// Start a Temporal workflow for the job
		we, err := temporalClient.ExecuteWorkflow(context.Background(), client.StartWorkflowOptions{
			ID:        "loadTestJob_" + job.ID,
			TaskQueue: "kratosMeterTaskQueue",
		}, "LoadTestWorkflow", job) // Ensure "LoadTestWorkflow" matches your actual workflow function name
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start load test workflow"})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{
			"message":    "Job created and workflow started",
			"workflowID": we.GetID(),
			"runID":      we.GetRunID(),
		})
	}
}
