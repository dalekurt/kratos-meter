package utils

import (
	"context"
	"log"
	"time"

	"github.com/dalekurt/kratos-meter/server/models"
	"go.mongodb.org/mongo-driver/mongo"
	"go.temporal.io/sdk/client"
)

// TemporalClientWrapper wraps the Temporal client along with MongoDB collections
type TemporalClientWrapper struct {
	TemporalClient    client.Client
	JobLogsCollection *mongo.Collection
}

// NewTemporalClientWrapper creates a new instance of TemporalClientWrapper
func NewTemporalClientWrapper(temporalClient client.Client, jobLogsCollection *mongo.Collection) *TemporalClientWrapper {
	return &TemporalClientWrapper{
		TemporalClient:    temporalClient,
		JobLogsCollection: jobLogsCollection,
	}
}

// UpdateWorkflowStatus listens for workflow status updates and logs them
func (tw *TemporalClientWrapper) UpdateWorkflowStatus(workflowID string) {
	ctx := context.Background()
	workflowRun := tw.TemporalClient.GetWorkflow(ctx, workflowID, "")

	log.Printf("Listening for completion of workflow: %s", workflowID)

	var result interface{}
	err := workflowRun.Get(ctx, &result)
	if err != nil {
		log.Printf("Workflow failed: %v", err)
		tw.logJobStatus(workflowID, "Failed", "Workflow execution failed")
	} else {
		log.Printf("Workflow completed successfully: %v", result)
		tw.logJobStatus(workflowID, "Completed", "Workflow execution completed successfully")
	}
}

// logJobStatus logs the status of a job to the JobLogsCollection
func (tw *TemporalClientWrapper) logJobStatus(jobID, status, message string) {
	ctx := context.Background()
	jobLog := models.JobLog{
		JobID:     jobID,
		Status:    status,
		Timestamp: time.Now(),
		Message:   message,
	}

	_, err := tw.JobLogsCollection.InsertOne(ctx, jobLog)
	if err != nil {
		log.Printf("Failed to log job status: %v", err)
	}
}
