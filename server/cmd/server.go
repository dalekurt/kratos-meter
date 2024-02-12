// server/cmd/server.go
package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"go.temporal.io/sdk/client"
	"log"
	"net/http"
	"os"
)

func main() {
	// Load .env file
	if err := godotenv.Load("../.env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Use os.Getenv to read the environment variables
	temporalHost := os.Getenv("TEMPORAL_HOST")
	temporalPort := os.Getenv("TEMPORAL_PORT")

	// Initialize Temporal client with environment variables
	temporalClient, err := client.NewClient(client.Options{
		HostPort: temporalHost + ":" + temporalPort,
	})
	if err != nil {
		log.Fatalf("Failed to create Temporal client: %v", err)
	}
	defer temporalClient.Close()

	// Define HTTP route handlers
	http.HandleFunc("/jobs", jobsHandler)
	http.HandleFunc("/jobs/{id}", jobStatusHandler)

	// Test endpoint
	http.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Test endpoint reached successfully")
	})

	// Start the HTTP server
	port := "8080"
	log.Printf("Server starting on port %s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// Handler for creating and listing load testing jobs
func jobsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		// Placeholder for creating a new load testing job
		fmt.Fprintf(w, "Creating a new load testing job\n")
	case "GET":
		// Placeholder for listing all load testing jobs
		fmt.Fprintf(w, "Listing all load testing jobs\n")
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// Handler for retrieving the status of a specific load testing job
func jobStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for job status retrieval
	fmt.Fprintf(w, "Retrieving status for job\n")
}
