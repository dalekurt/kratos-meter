// server/workflows/activities.go
package workflows

import (
	"context"
	"fmt"
	"github.com/dalekurt/kratos-meter/server/shared"
	"os"
	"os/exec"
	"path/filepath"
)

func InitializeJobActivity(ctx context.Context, jobDetails shared.JobDetails, repoPath string) (string, error) {
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

	// Log the directory path where the repository is cloned
	log.Printf("Repository cloned to: %s", repoPath)

	return repoPath, nil
}

func ExecuteTestActivity(ctx context.Context, jobDetails shared.JobDetails, repoPath string) (string, error) {
	testScriptPath := filepath.Join(repoPath, jobDetails.Filename)
	k6Cmd := exec.Command("k6", "run", testScriptPath)
	output, err := k6Cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to execute test: %v, output: %s", err, string(output))
	}
	return "Test execution complete. Output: " + string(output), nil
}

func ProcessResultsActivity(ctx context.Context, testResult string) (string, error) {
	return "Results processed: " + testResult, nil
}

func CleanupActivity(ctx context.Context, repoPath string) (string, error) {
	err := os.RemoveAll(repoPath)
	if err != nil {
		return "", fmt.Errorf("failed to clean up repo directory: %v", err)
	}
	return "Cleanup complete", nil
}
