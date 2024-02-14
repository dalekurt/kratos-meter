// server/workflows/loadtest_workflow.go
package workflows

import (
	"github.com/dalekurt/kratos-meter/server/shared"
	"go.temporal.io/sdk/workflow"
	"time"
)

// LoadTestWorkflow defines the workflow for load testing
func LoadTestWorkflow(ctx workflow.Context, jobDetails shared.JobDetails) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Minute, // Adjust based on expected activity duration
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var repoPath string
	err := workflow.ExecuteActivity(ctx, CloneRepoActivity, jobDetails).Get(ctx, &repoPath)
	if err != nil {
		return err
	}

	var initResult string
	err = workflow.ExecuteActivity(ctx, InitializeJobActivity, jobDetails, repoPath).Get(ctx, &initResult)
	if err != nil {
		return err
	}

	var testResult string
	err = workflow.ExecuteActivity(ctx, ExecuteTestActivity, jobDetails, repoPath).Get(ctx, &testResult)
	if err != nil {
		return err
	}

	var processResult string
	err = workflow.ExecuteActivity(ctx, ProcessResultsActivity, testResult).Get(ctx, &processResult)
	if err != nil {
		return err
	}

	var cleanupResult string
	err = workflow.ExecuteActivity(ctx, CleanupActivity, repoPath).Get(ctx, &cleanupResult)
	if err != nil {
		return err
	}

	return nil
}
