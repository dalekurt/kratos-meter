// worker/cmd/worker.go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/dalekurt/kratos-meter/server/shared"
	"github.com/dalekurt/kratos-meter/server/workflows"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func main() {
	if err := loadEnv(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Initialize the MinIO client
	shared.InitMinioClient()

	mongoClient, mongoCollection, err := connectToMongoDB()
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect(context.Background())

	temporalClient, err := client.NewClient(client.Options{})
	if err != nil {
		log.Fatalf("Failed to create Temporal client: %v", err)
	}
	defer temporalClient.Close()

	const taskQueue = "kratosMeterTaskQueue"
	w := worker.New(temporalClient, taskQueue, worker.Options{})

	registerWorkflowsAndActivities(w, mongoCollection)

	startWorker(w)
}

func loadEnv() error {
	envPath := filepath.Join("..", ".env")
	return godotenv.Load(envPath)
}

func connectToMongoDB() (*mongo.Client, *mongo.Collection, error) {
	mongoURI := os.Getenv("MONGODB_URI")
	mongoDB := os.Getenv("MONGODB_DATABASE")
	mongoCollectionName := os.Getenv("MONGODB_COLLECTION")

	mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		return nil, nil, err
	}

	if err := mongoClient.Ping(context.Background(), nil); err != nil {
		return nil, nil, err
	}

	mongoCollection := mongoClient.Database(mongoDB).Collection(mongoCollectionName)
	return mongoClient, mongoCollection, nil
}

func registerWorkflowsAndActivities(w worker.Worker, mongoCollection *mongo.Collection) {
	w.RegisterWorkflow(workflows.LoadTestWorkflow)

	w.RegisterActivityWithOptions(
		func(ctx context.Context, jobDetails shared.JobDetails, repoPath string) (string, error) {
			return workflows.InitializeJobActivity(ctx, mongoCollection, jobDetails, repoPath)
		},
		activity.RegisterOptions{Name: "InitializeJobActivity"},
	)

	w.RegisterActivityWithOptions(
		func(ctx context.Context, jobDetails shared.JobDetails) (string, error) {
			return workflows.CloneRepoActivity(ctx, jobDetails)
		},
		activity.RegisterOptions{Name: "CloneRepoActivity"},
	)

	w.RegisterActivityWithOptions(
		func(ctx context.Context, jobDetails shared.JobDetails, repoPath string) (string, error) {
			return workflows.ExecuteTestActivity(ctx, mongoCollection, jobDetails, repoPath)
		},
		activity.RegisterOptions{Name: "ExecuteTestActivity"},
	)

	w.RegisterActivityWithOptions(
		func(ctx context.Context, testResult string) (string, error) {
			return workflows.ProcessResultsActivity(ctx, mongoCollection, testResult)
		},
		activity.RegisterOptions{Name: "ProcessResultsActivity"},
	)

	w.RegisterActivityWithOptions(
		func(ctx context.Context, repoPath string) (string, error) {
			return workflows.CleanupActivity(ctx, mongoCollection, repoPath)
		},
		activity.RegisterOptions{Name: "CleanupActivity"},
	)
}

func startWorker(w worker.Worker) {
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := w.Run(worker.InterruptCh()); err != nil {
			log.Fatalf("Failed to start worker: %v", err)
		}
	}()

	sig := <-sigs
	log.Printf("Received signal: %v, initiating shutdown.", sig)

	w.Stop()
	log.Println("Worker shutdown gracefully.")
}
