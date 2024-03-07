// server/models/environment_variable.go
package models

type EnvironmentVariable struct {
	Key        string `bson:"key" json:"key"`
	Value      string `bson:"value,omitempty" json:"value,omitempty"`
	IsSecret   bool   `bson:"isSecret" json:"isSecret"`
	SecretPath string `bson:"secretPath,omitempty" json:"secretPath,omitempty"`
}
