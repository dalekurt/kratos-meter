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
	"github.com/minio/minio-go/v7"
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

	// Initialize an empty Git repository
	gitInitCmd := exec.Command("git", "init", repoPath)
	if output, err := gitInitCmd.CombinedOutput(); err != nil {
		os.RemoveAll(repoPath) // Clean up the directory on failure
		return "", fmt.Errorf("failed to init git repo: %v, output: %s", err, string(output))
	}

	// Configure sparse-checkout
	if err := os.WriteFile(filepath.Join(repoPath, ".git", "info", "sparse-checkout"), []byte(jobDetails.Filename), 0644); err != nil {
		os.RemoveAll(repoPath)
		return "", fmt.Errorf("failed to configure sparse-checkout: %v", err)
	}

	gitConfigCmd := exec.Command("git", "-C", repoPath, "config", "core.sparseCheckout", "true")
	if output, err := gitConfigCmd.CombinedOutput(); err != nil {
		os.RemoveAll(repoPath)
		return "", fmt.Errorf("failed to enable sparse-checkout: %v, output: %s", err, string(output))
	}

	// Add remote and fetch the specified branch
	gitRemoteAddCmd := exec.Command("git", "-C", repoPath, "remote", "add", "origin", jobDetails.GitRepo)
	if output, err := gitRemoteAddCmd.CombinedOutput(); err != nil {
		os.RemoveAll(repoPath)
		return "", fmt.Errorf("failed to add git remote: %v, output: %s", err, string(output))
	}

	// Fetch the latest changes from the remote
	gitFetchCmd := exec.Command("git", "-C", repoPath, "fetch", "origin")
	if output, err := gitFetchCmd.CombinedOutput(); err != nil {
		os.RemoveAll(repoPath)
		return "", fmt.Errorf("failed to fetch latest changes from git: %v, output: %s", err, string(output))
	}

	// Reset the local copy to match the remote branch
	gitResetCmd := exec.Command("git", "-C", repoPath, "reset", "--hard", "origin/"+jobDetails.GitBranch)
	if output, err := gitResetCmd.CombinedOutput(); err != nil {
		os.RemoveAll(repoPath)
		return "", fmt.Errorf("failed to reset local copy to remote branch: %v, output: %s", err, string(output))
	}

	// Checkout the file
	gitCheckoutCmd := exec.Command("git", "-C", repoPath, "checkout", "FETCH_HEAD", jobDetails.Filename)
	if output, err := gitCheckoutCmd.CombinedOutput(); err != nil {
		os.RemoveAll(repoPath)
		return "", fmt.Errorf("failed to checkout file: %v, output: %s", err, string(output))
	}

	log.Printf("Test script fetched to: %s", filepath.Join(repoPath, jobDetails.Filename))

	return repoPath, nil
}

func ExecuteTestActivity(ctx context.Context, mongoCollection *mongo.Collection, jobDetails shared.JobDetails, repoPath string) (string, error) {
	if err := loadEnv(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	testScriptPath := filepath.Join(repoPath, jobDetails.Filename)
	customK6BinaryPath := os.Getenv("CUSTOM_K6_BINARY_PATH")
	prometheusRemoteWriteURL := os.Getenv("PROMETHEUS_REMOTE_WRITE_URL")

	// Execute the k6 test
	// k6Cmd := exec.Command(customK6BinaryPath, "run", "--out", "xk6-prometheus-rw="+prometheusRemoteWriteURL, "--tag", "testid="+jobDetails.ID, testScriptPath)
	k6Cmd := exec.Command(customK6BinaryPath, "run",
		"-e", fmt.Sprintf("JOB_ID=%s", jobDetails.ID),
		"--out", "xk6-prometheus-rw="+prometheusRemoteWriteURL,
		"--tag", "testid="+jobDetails.ID, testScriptPath)
	output, err := k6Cmd.CombinedOutput()
	if err != nil {
		if updateErr := UpdateJobStatus(ctx, mongoCollection, jobDetails.ID, "Failed"); updateErr != nil {
			log.Printf("Failed to update job status to Failed: %v", updateErr)
		}
		return "", fmt.Errorf("failed to execute test: %v, output: %s", err, string(output))
	}

	// Attempt to find the screenshot file using the naming convention
	pattern := "/tmp/screenshot_*.png"
	files, err := filepath.Glob(pattern)
	if err != nil {
		log.Printf("Failed to search for screenshot files: %v", err)
		// Handle error
	}

	if len(files) == 0 {
		log.Println("No screenshot files found matching the pattern")
		// Handle the case where no screenshot files are found
	} else {
		// Assuming the latest screenshot is what you want
		screenshotPath := files[len(files)-1] // The last file should be the latest if sorted by name
		log.Printf("Uploading screenshot: %s", screenshotPath)
		// uploadErr := UploadScreenshots(ctx, screenshotPath, jobDetails.ID)
		uploadErr := UploadScreenshots(ctx, jobDetails.ID)
		if uploadErr != nil {
			log.Printf("Failed to upload screenshot: %v", uploadErr)
			// Handle upload error
		}
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

// UploadScreenshots uploads all screenshots for a given jobID.
func UploadScreenshots(ctx context.Context, jobID string) error {
	bucketName := os.Getenv("MINIO_BUCKET_NAME")
	if bucketName == "" {
		log.Println("MINIO_BUCKET_NAME environment variable not set")
		return fmt.Errorf("MINIO_BUCKET_NAME environment variable not set")
	}

	// Find all screenshot files matching the pattern.
	pattern := fmt.Sprintf("/tmp/screenshot_%s_*.png", jobID)
	files, err := filepath.Glob(pattern)
	if err != nil {
		log.Printf("Failed to search for screenshot files: %v", err)
		return err
	}

	if len(files) == 0 {
		log.Println("No screenshot files found matching the pattern:", pattern)
		return nil // Or return an error if no screenshots is considered a failure state
	}

	for _, file := range files {
		fileName := filepath.Base(file)
		objectName := fmt.Sprintf("%s/%s", jobID, fileName)

		// Open the screenshot file for reading.
		fileReader, err := os.Open(file)
		if err != nil {
			log.Printf("Failed to open screenshot file: %v", err)
			continue // Skip to the next file.
		}
		defer fileReader.Close()

		// Upload the screenshot file to Minio.
		_, err = shared.MinioClient.PutObject(ctx, bucketName, objectName, fileReader, -1, minio.PutObjectOptions{ContentType: "image/png"})
		if err != nil {
			log.Printf("Failed to upload screenshot to Minio: %v", err)
			continue // Skip to the next file.
		}

		log.Printf("Successfully uploaded screenshot: %s to Minio bucket: %s", objectName, bucketName)
	}

	return nil
}
