// server/utils/utils.go
package utils

import (
	"github.com/google/uuid"
)

// GenerateUniqueID creates a new UUID string.
func GenerateUniqueID() string {
	return uuid.New().String()
}
