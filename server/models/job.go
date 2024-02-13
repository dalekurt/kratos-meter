// server/models/job.go
package models

type Job struct {
	ID     string `bson:"_id" json:"id"`
	Name   string `bson:"name" json:"name"`
	Status string `bson:"status" json:"status"`
}
