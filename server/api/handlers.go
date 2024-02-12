// server/api/handlers.go

package api

import (
	"encoding/json"
	"github.com/dalekurt/kratos-meter/server/workflows"
	"go.temporal.io/sdk/client"
	"net/http"
)

func CreateJobHandler(temporalClient client.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var jobConfig JobConfig
		err := json.NewDecoder(r.Body).Decode(&jobConfig)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Start a new Temporal workflow for the load testing job
		we, err := temporalClient.ExecuteWorkflow(context.Background(), client.StartWorkflowOptions{
			ID:        "loadTestJob_" + generateUniqueID(),
			TaskQueue: "kratosMeterTaskQueue",
		}, workflows.LoadTestWorkflow, jobConfig)
		if err != nil {
			http.Error(w, "Failed to start load test workflow", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{
			"workflowID": we.ID,
			"runID":      we.RunID,
		})
	}
}
