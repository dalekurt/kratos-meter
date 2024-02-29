// server/models/job.go
package models

import (
	"time"
)

type Job struct {
	ID          string `bson:"id" json:"id"` // Use 'id' field to store UUID
	ProjectID   string `bson:"projectId" json:"projectId"`
	Name        string `bson:"name" json:"name"`
	Description string `bson:"description" json:"description"`
	Filename    string `bson:"filename" json:"filename"`
	GitRepo     string `bson:"gitRepo" json:"gitRepo"`
	GitBranch   string `bson:"gitBranch" json:"gitBranch"`
	// ScreenshotEnabled bool      `bson:"screenshotEnabled"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}
