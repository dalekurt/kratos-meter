// server/api/project_handlers.go
package api

import (
	"context"
	"github.com/dalekurt/kratos-meter/server/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"net/http"
)

// CreateProject creates a new project and saves it to MongoDB
func (hd *HandlerDependencies) CreateProject(c *gin.Context) {
	var project models.Project

	if err := c.BindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project.ProjectID = uuid.New().String()

	if _, err := hd.ProjectsCollection.InsertOne(context.Background(), project); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project in the database"})
		return
	}

	c.JSON(http.StatusCreated, project)
}

// GetProjects returns all projects from the database
func (hd *HandlerDependencies) GetProjects(c *gin.Context) {
	var projects []models.Project
	cursor, err := hd.ProjectsCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve projects"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var project models.Project
		if err := cursor.Decode(&project); err != nil {
			continue // Log the error but don't break
		}
		projects = append(projects, project)
	}

	if err := cursor.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve projects"})
		return
	}

	c.JSON(http.StatusOK, projects)
}

// GetProjectByID retrieves a project by its ID from the database
func (hd *HandlerDependencies) GetProjectByID(c *gin.Context) {
	projectID := c.Param("id")

	var project models.Project
	if err := hd.ProjectsCollection.FindOne(context.Background(), bson.M{"projectId": projectID}).Decode(&project); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve project"})
		}
		return
	}

	c.JSON(http.StatusOK, project)
}

// UpdateProject updates a project's details
func (hd *HandlerDependencies) UpdateProject(c *gin.Context) {
	projectID := c.Param("id")
	var project models.Project

	if err := c.BindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := hd.ProjectsCollection.UpdateOne(context.Background(), bson.M{"projectId": projectID}, bson.M{"$set": project})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project updated successfully"})
}

// DeleteProject deletes a project by its ID
func (hd *HandlerDependencies) DeleteProject(c *gin.Context) {
	projectID := c.Param("id")

	result, err := hd.ProjectsCollection.DeleteOne(context.Background(), bson.M{"projectId": projectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
