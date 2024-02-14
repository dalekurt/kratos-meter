// server/cmd/server.go
package main

import (
	"context"
	"log"
	"os"
	"path/filepath"

	"github.com/dalekurt/kratos-meter/server/api"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.temporal.io/sdk/client"
)

func main() {
	// Construct the path to the .env file
	envPath := filepath.Join("..", ".env")

	// Load .env file
	if err := godotenv.Load(envPath); err != nil {
		log.Printf("Warning: Could not load .env file from %s: %v\n", envPath, err)
	} else {
		log.Println("Successfully loaded .env file.")
	}

	// Get MongoDB URI from environment variables
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI environment variable is not set.")
	}

	// Initialize MongoDB connection
	log.Println("Connecting to MongoDB...")
	mongoClient, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect(context.Background())

	// Check MongoDB connection
	log.Println("Pinging MongoDB...")
	if err := mongoClient.Ping(context.Background(), nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	} else {
		log.Println("MongoDB connection established.")
	}

	// Get MongoDB database and collection from environment variables
	mongoDB := os.Getenv("MONGODB_DATABASE")
	mongoCollectionName := os.Getenv("MONGODB_COLLECTION")
	if mongoDB == "" || mongoCollectionName == "" {
		log.Fatal("MONGODB_DATABASE or MONGODB_COLLECTION environment variable is not set.")
	}

	// Access the MongoDB collection
	jobsCollection := mongoClient.Database(mongoDB).Collection(mongoCollectionName)
	log.Printf("Using MongoDB collection: %s/%s\n", mongoDB, mongoCollectionName)

	// Initialize Temporal client
	log.Println("Initializing Temporal client...")
	temporalClient, err := client.NewClient(client.Options{})
	if err != nil {
		log.Fatalf("Failed to create Temporal client: %v", err)
	}
	defer temporalClient.Close()
	log.Println("Temporal client initialized.")

	// Instantiate HandlerDependencies with necessary dependencies
	deps := api.HandlerDependencies{
		TemporalClient:  temporalClient,
		MongoCollection: jobsCollection,
	}

	// Initialize Gin router
	router := gin.Default()

	// Register job creation endpoint with MongoDB and Temporal clients
	// router.POST("/jobs", api.CreateJob(jobsCollection, temporalClient))
	// router.GET("/jobs", api.GetJobs(jobsCollection))
	// router.GET("/jobs/:id", api.GetJobByID(jobsCollection))
	router.POST("/jobs", deps.CreateJob)
	router.GET("/jobs", deps.GetJobs)
	router.GET("/jobs/:id", deps.GetJobByID)

	// Start the HTTP server
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "5000" // Default port if not specified in .env
	}
	log.Printf("Starting server on port %s...\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
