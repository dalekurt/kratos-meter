// worker/cmd/worker.go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"

	"github.com/dalekurt/kratos-meter/server/workflows"
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
	mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect(context.Background())

	// Check MongoDB connection
	if err := mongoClient.Ping(context.Background(), nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	log.Println("MongoDB connection established.")

	// Create a Temporal client.
	temporalClient, err := client.NewClient(client.Options{})
	if err != nil {
		log.Fatalf("Failed to create Temporal client: %v", err)
	}
	defer temporalClient.Close()

	// Define a task queue name.
	const taskQueue = "kratosMeterTaskQueue"

	// Create a new worker that listens on the specified task queue.
	w := worker.New(temporalClient, taskQueue, worker.Options{})

	// Register your workflows and activities with the worker.
	w.RegisterWorkflow(workflows.LoadTestWorkflow)
	w.RegisterActivity(workflows.InitializeJobActivity)
	w.RegisterActivity(workflows.CloneRepoActivity)
	w.RegisterActivity(workflows.ExecuteTestActivity)
	w.RegisterActivity(workflows.ProcessResultsActivity)
	w.RegisterActivity(workflows.CleanupActivity)

	// Set up a channel to listen for OS signals for graceful shutdown.
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	// Start the worker in a goroutine.
	go func() {
		if err := w.Run(worker.InterruptCh()); err != nil {
			log.Fatalf("Failed to start worker: %v", err)
		}
	}()

	// Wait for shutdown signals.
	sig := <-sigs
	log.Printf("Received signal: %v, initiating shutdown.", sig)

	// Initiate a graceful shutdown.
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	w.Stop()

	// Close the MongoDB connection.
	if err := mongoClient.Disconnect(ctx); err != nil {
		log.Printf("Failed to disconnect MongoDB: %v", err)
	}

	log.Println("Worker shutdown gracefully.")
}
