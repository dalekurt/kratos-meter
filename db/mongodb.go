// db/mongodb.go
package db

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

var MongoCollection *mongo.Collection

func ConnectMongo(uri, dbName, collectionName string) {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	MongoCollection = client.Database(dbName).Collection(collectionName)
}
