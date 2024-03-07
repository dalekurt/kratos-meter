// server/api/handler_dependencies.go
package api

import (
	"github.com/dalekurt/kratos-meter/server/utils"
	"github.com/hashicorp/vault/api"
	"go.mongodb.org/mongo-driver/mongo"
	"go.temporal.io/sdk/client"
)

// HandlerDependencies struct holds the dependencies for the API handlers
type HandlerDependencies struct {
	TemporalClient        client.Client
	TemporalClientWrapper *utils.TemporalClientWrapper
	JobsCollection        *mongo.Collection
	ProjectsCollection    *mongo.Collection
	JobLogsCollection     *mongo.Collection
	VaultClient           *api.Client
}
