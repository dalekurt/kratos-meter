// server/workflows/activities.go
package workflows

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/dalekurt/kratos-meter/server/shared"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// UpdateJobStatus updates the status of a job in MongoDB.
func UpdateJobStatus(ctx context.Context, mongoCollection *mongo.Collection, jobID string, newStatus string) error {
	filter := bson.M{"id": jobID}
	update := bson.M{"$set": bson.M{"status": newStatus}}
	_, err := mongoCollection.UpdateOne(ctx, filter, update)
	return err
}

func InitializeJobActivity(ctx context.Context, mongoCollection *mongo.Collection, jobDetails shared.JobDetails, repoPath string) (string, error) {
	// Update job status to "In Progress"
	if err := UpdateJobStatus(ctx, mongoCollection, jobDetails.ID, "In Progress"); err != nil {
		log.Printf("Failed to update job status to In Progress: %v", err)
	}

	if jobDetails.Filename == "" {
		return "", fmt.Errorf("no test script filename provided")
	}
	testScriptPath := filepath.Join(repoPath, jobDetails.Filename)
	if _, err := os.Stat(testScriptPath); os.IsNotExist(err) {
		return "", fmt.Errorf("test script %s does not exist", jobDetails.Filename)
	}
	return "Initialization complete. Test script: " + jobDetails.Filename, nil
}

func CloneRepoActivity(ctx context.Context, jobDetails shared.JobDetails) (string, error) {
	repoPath, err := os.MkdirTemp("", "repo-*")
	if err != nil {
		return "", fmt.Errorf("failed to create temp directory: %v", err)
	}

	gitCloneCmd := exec.Command("git", "clone", "-b", jobDetails.GitBranch, jobDetails.GitRepo, repoPath)
	if output, err := gitCloneCmd.CombinedOutput(); err != nil {
		os.RemoveAll(repoPath) // Clean up the directory on failure
		return "", fmt.Errorf("failed to clone git repo: %v, output: %s", err, string(output))
	}

	log.Printf("Repository cloned to: %s", repoPath)

	return repoPath, nil
}

func ExecuteTestActivity(ctx context.Context, mongoCollection *mongo.Collection, jobDetails shared.JobDetails, repoPath string) (string, error) {
	if err := loadEnv(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	testScriptPath := filepath.Join(repoPath, jobDetails.Filename)

	// Use environment variables for custom k6 binary path and Prometheus Remote Write URL
	customK6BinaryPath := os.Getenv("CUSTOM_K6_BINARY_PATH")
	prometheusRemoteWriteURL := os.Getenv("PROMETHEUS_REMOTE_WRITE_URL")

	// Construct the k6 command with the Prometheus Remote Write extension flag and the testid tag
	k6Cmd := exec.Command(customK6BinaryPath, "run", "--out", "xk6-prometheus-rw="+prometheusRemoteWriteURL, "--tag", "testid="+jobDetails.ID, testScriptPath)

	output, err := k6Cmd.CombinedOutput()
	if err != nil {
		// Update job status to "Failed"
		if updateErr := UpdateJobStatus(ctx, mongoCollection, jobDetails.ID, "Failed"); updateErr != nil {
			log.Printf("Failed to update job status to Failed: %v", updateErr)
		}
		return "", fmt.Errorf("failed to execute test: %v, output: %s", err, string(output))
	}

	// Update job status to "Completed"
	if updateErr := UpdateJobStatus(ctx, mongoCollection, jobDetails.ID, "Completed"); updateErr != nil {
		log.Printf("Failed to update job status to Completed: %v", updateErr)
	}

	return "Test execution complete. Output: " + string(output), nil
}

func ProcessResultsActivity(ctx context.Context, mongoCollection *mongo.Collection, testResult string) (string, error) {
	// Process test results here
	return "Results processed: " + testResult, nil
}

func CleanupActivity(ctx context.Context, mongoCollection *mongo.Collection, repoPath string) (string, error) {
	err := os.RemoveAll(repoPath)
	if err != nil {
		return "", fmt.Errorf("failed to clean up repo directory: %v", err)
	}
	return "Cleanup complete", nil
}

func loadEnv() error {
	envPath := filepath.Join("..", ".env")
	return godotenv.Load(envPath)
}
