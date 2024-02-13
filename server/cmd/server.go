// server/cmd/server.go
package main

import (
	"github.com/dalekurt/kratos-meter/db"
	"github.com/dalekurt/kratos-meter/server/api"
	"github.com/gin-gonic/gin"
	"go.temporal.io/sdk/client"
	"log"
)

func main() {
	// Initialize MongoDB connection
	mongoCollection, err := db.ConnectMongo("mongodb://localhost:27017", "kratosMeterDB", "jobs")
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Initialize Temporal client
	temporalClient, err := client.NewClient(client.Options{})
	if err != nil {
		log.Fatalf("Failed to create Temporal client: %v", err)
	}
	defer temporalClient.Close()

	// Initialize Gin router
	router := gin.Default()

	// Register job creation endpoint with MongoDB and Temporal clients
	router.POST("/jobs", api.CreateJob(mongoCollection, temporalClient))

	// Start the HTTP server
	if err := router.Run(":3000"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
