// server/shared/types.go
package shared

// JobDetails struct to pass job-related data to the workflow and activities
type JobDetails struct {
	ID           string
	Name         string
	Description  string
	Filename     string
	GitRepo      string
	GitBranch    string
	EnvVariables map[string]string
}
