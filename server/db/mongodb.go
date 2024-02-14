// server/db/mongodb.go
package db

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

// ConnectMongo connects to MongoDB and ensures the database and collection exist.
func ConnectMongo(uri, dbName, collectionName string) (*mongo.Collection, error) {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Ping the MongoDB server
	if err := client.Ping(context.TODO(), nil); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	// Check for the specified database and collection
	collection := client.Database(dbName).Collection(collectionName)

	// TODO: Add logic here to check if the database and collection actually exist,
	// and log messages or create them as needed. This step might involve running a
	// query against the database or leveraging MongoDB commands to check existence.

	return collection, nil
}
