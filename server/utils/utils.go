// server/utils/utils.go
package utils

import "github.com/google/uuid"

// GenerateUniqueID creates a new UUID and returns it as a string.
func GenerateUniqueID() string {
	return uuid.New().String()
}
