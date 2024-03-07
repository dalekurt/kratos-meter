// server/cmd/server.go
package main

import (
	"context"
	"github.com/dalekurt/kratos-meter/server/api"
	"github.com/dalekurt/kratos-meter/server/shared"
	"github.com/dalekurt/kratos-meter/server/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.temporal.io/sdk/client"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
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

	// Initialize Vault client
	shared.InitVaultClient()

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
	jobsCollection := mongoClient.Database(mongoDB).Collection("jobs")
	projectsCollection := mongoClient.Database(mongoDB).Collection("projects")
	jobLogsCollection := mongoClient.Database(mongoDB).Collection("joblogs")
	log.Printf("Using MongoDB collection: %s/%s\n", mongoDB, mongoCollectionName)

	// Initialize Temporal client
	log.Println("Initializing Temporal client...")
	temporalClient, err := client.NewClient(client.Options{})
	if err != nil {
		log.Fatalf("Failed to create Temporal client: %v", err)
	}
	defer temporalClient.Close()
	log.Println("Temporal client initialized.")

	temporalClientWrapper := utils.NewTemporalClientWrapper(temporalClient, jobLogsCollection)

	deps := api.HandlerDependencies{
		TemporalClientWrapper: temporalClientWrapper,
		JobsCollection:        jobsCollection,
		ProjectsCollection:    projectsCollection,
		JobLogsCollection:     jobLogsCollection,
		VaultClient:           shared.VaultClient,
	}

	// Initialize Gin router
	router := gin.Default()

	// Configure CORS to allow your frontend application
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*", "http://localhost:5001"}, // TODO: Use environment variable for AllowOrigins
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowWildcard:    true,
		MaxAge:           12 * time.Hour,
	}))

	// Routers for projects endpoints
	router.GET("/projects", deps.GetProjects)
	router.POST("/projects", deps.CreateProject)
	router.GET("/projects/:id", deps.GetProjectByID)
	router.PUT("/projects/:id", deps.UpdateProject)
	router.DELETE("/projects/:id", deps.DeleteProject)
	router.GET("/projects/:id/jobs", deps.GetJobsByProjectID)

	// Routers for jobs endpoints
	router.POST("/jobs", deps.CreateJob)
	router.GET("/jobs", deps.GetJobs)
	router.GET("/jobs/:id", deps.GetJobByID)

	// Routers for logs endpoint
	router.GET("/logs/:jobid", deps.GetJobLogs)
	// Routers for start endpoint
	router.POST("/start/:jobid", deps.StartJob)

	// Server setup
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "5000"
	}
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Run server in a goroutine
	go func() {
		log.Printf("Starting server on port %s...\n", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
