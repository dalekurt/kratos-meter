// server/db/mongodb.go
package db

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ConnectMongo connects to MongoDB and ensures the database and collection exist.
func ConnectMongo(uri, dbName, collectionName string) (*mongo.Collection, error) {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	if err := client.Ping(context.TODO(), nil); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	collection := client.Database(dbName).Collection(collectionName)
	return collection, nil
}

// AddEnvironmentVariableToProject adds or updates an environment variable for a given project.
func AddEnvironmentVariableToProject(collection *mongo.Collection, projectID string, key string, value string, isSecret bool, secretPath string) error {
	update := bson.M{
		"$push": bson.M{
			"environmentVariables": bson.M{
				"key":        key,
				"value":      value,
				"isSecret":   isSecret,
				"secretPath": secretPath, // Include the secret path if applicable
			},
		},
	}

	_, err := collection.UpdateByID(context.TODO(), projectID, update)
	if err != nil {
		return fmt.Errorf("failed to add environment variable to project: %w", err)
	}

	return nil
}
