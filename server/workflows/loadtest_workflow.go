// server/workflows/loadtest_workflow.go
package workflows

import (
	"context"

	"go.temporal.io/sdk/workflow"
)

// LoadTestWorkflow is the workflow definition for load testing jobs
func LoadTestWorkflow(ctx workflow.Context, jobConfig string) (string, error) {
	// Use workflow.ExecuteActivity to call each activity in the desired sequence
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var initResult string
	err := workflow.ExecuteActivity(ctx, InitializeJob, jobConfig).Get(ctx, &initResult)
	if err != nil {
		return "", err
	}

	var executionResult string
	err = workflow.ExecuteActivity(ctx, ExecuteTest, jobConfig).Get(ctx, &executionResult)
	if err != nil {
		return "", err
	}

	var resultProcessingResult string
	err = workflow.ExecuteActivity(ctx, ProcessResults, executionResult).Get(ctx, &resultProcessingResult)
	if err != nil {
		return "", err
	}

	var cleanupResult string
	err = workflow.ExecuteActivity(ctx, Cleanup).Get(ctx, &cleanupResult)
	if err != nil {
		return "", err
	}

	return "Load Test Completed Successfully", nil
}
