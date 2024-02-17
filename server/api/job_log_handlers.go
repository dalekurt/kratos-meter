// server/api/job_log_handlers.go

// job_log_handlers.go
package api

import (
	"context"
	"log"
	"net/http"

	"github.com/dalekurt/kratos-meter/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// GetJobLogs retrieves and returns the logs for a given job ID
func (hd *HandlerDependencies) GetJobLogs(c *gin.Context) {
	jobID := c.Param("jobid")

	var jobLogs []models.JobLog = make([]models.JobLog, 0)

	cursor, err := hd.JobLogsCollection.Find(context.Background(), bson.M{"jobId": jobID})
	if err != nil {
		log.Printf("Failed to retrieve job logs from MongoDB for jobID %s: %v", jobID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve job logs"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var jobLog models.JobLog
		if err := cursor.Decode(&jobLog); err != nil {
			log.Printf("Failed to decode job log from MongoDB: %v", err)
			continue // Optionally, decide if you want to stop processing further
		}
		jobLogs = append(jobLogs, jobLog)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error when retrieving job logs from MongoDB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cursor error in retrieving job logs"})
		return
	}

	if len(jobLogs) == 0 {
		log.Printf("No job logs found for jobID %s", jobID)
		// Optionally, decide if you want to return a different status or message when no logs are found
	}

	c.JSON(http.StatusOK, jobLogs)
}
