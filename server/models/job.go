// server/models/job.go
package models

type Job struct {
	ID          string `bson:"id" json:"id"` // Use 'id' field to store UUID
	Name        string `bson:"name" json:"name"`
	Description string `bson:"description" json:"description"`
	Filename    string `bson:"filename" json:"filename"`
	GitRepo     string `bson:"gitRepo" json:"gitRepo"`
	GitBranch   string `bson:"gitBranch" json:"gitBranch"`
	Status      string `bson:"status" json:"status"`
}
