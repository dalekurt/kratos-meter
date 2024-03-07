// server/models/project.go
package models

type Project struct {
	ProjectID            string                `bson:"projectId" json:"projectId"`
	ProjectName          string                `json:"projectName"`
	MaxVUPerTest         int                   `json:"maxVUPerTest"`
	MaxDurationPerTest   string                `json:"maxDurationPerTest"` // TODO: Parse the maxDurationPerTest into a time
	EnvironmentVariables []EnvironmentVariable `bson:"environmentVariables" json:"environmentVariables"`
}
