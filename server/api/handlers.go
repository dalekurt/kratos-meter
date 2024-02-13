package api

import (
	"context"
	"net/http"

	"github.com/dalekurt/kratos-meter/models"
	"github.com/dalekurt/kratos-meter/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.temporal.io/sdk/client"
)

// CreateJob is a Gin handler function that creates a new job, saves it to MongoDB, and starts a Temporal workflow.
func CreateJob(mongoCollection *mongo.Collection, temporalClient client.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var job models.Job
		if err := c.BindJSON(&job); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Generate unique ID for the job and set initial status
		job.ID = utils.GenerateUniqueID() // Make sure to implement this function in the utils package
		job.Status = "Pending"

		// Insert job into MongoDB
		if _, err := mongoCollection.InsertOne(context.Background(), job); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job in the database"})
			return
		}

		// Start a Temporal workflow for the job
		// Make sure your workflow function is correctly implemented in the workflows package
		if _, err := temporalClient.ExecuteWorkflow(context.Background(), client.StartWorkflowOptions{
			ID:        "loadTestJob_" + job.ID,
			TaskQueue: "kratosMeterTaskQueue",
		}, "LoadTestWorkflow", job); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start load test workflow"})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{
			"message": "Job created and workflow started",
			"jobID":   job.ID,
		})
	}
}
