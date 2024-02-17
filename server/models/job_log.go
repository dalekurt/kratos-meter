// server/models/job_log.go

package models

import (
	"time"
)

type JobLog struct {
	JobID     string    `bson:"jobId" json:"jobId"`
	Status    string    `bson:"status" json:"status"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
	Message   string    `bson:"message,omitempty" json:"message,omitempty"`
}
