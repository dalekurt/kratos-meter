// server/temporal/setup.go
package temporal

import (
	"log"

	"github.com/dalekurt/kratos-meter/server/workflows"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func StartWorker() {
	// Create the Temporal client
	c, err := client.NewClient(client.Options{})
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	// Create a new worker
	w := worker.New(c, "LoadTestTaskQueue", worker.Options{})

	// Register your workflows and activities with the worker
	w.RegisterWorkflow(workflows.LoadTestWorkflow)
	w.RegisterActivity(workflows.InitializeJob)
	w.RegisterActivity(workflows.ExecuteTest)
	w.RegisterActivity(workflows.ProcessResults)
	w.RegisterActivity(workflows.Cleanup)

	// Start the worker
	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalf("Failed to start worker: %v", err)
	}
}
