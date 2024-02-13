// server/utils.go
package server

import (
	"github.com/google/uuid"
)

// generateUniqueID creates a new UUID and returns it as a string.
func generateUniqueID() string {
	return uuid.New().String()
}
