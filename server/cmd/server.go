package main

import (
	"context"
	"log"
	"os"

	"github.com/dalekurt/kratos-meter/api"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.temporal.io/sdk/client"
)

func main() {
	// Load environment variables

	// Initialize MongoDB connection
	mongoClient, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(os.Getenv("MONGODB_HOST")))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	mongoCollection := mongoClient.Database(os.Getenv("MONGODB_DATABASE")).Collection("jobs")

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
