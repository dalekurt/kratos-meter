// server/shared/vault_client.go
package shared

import (
	"fmt"
	"log"
	"os"

	"github.com/hashicorp/vault/api"
)

var VaultClient *api.Client

// InitVaultClient initializes the connection to Vault.
func InitVaultClient() {
	vaultAddr := os.Getenv("VAULT_ADDR")
	if vaultAddr == "" {
		log.Fatal("VAULT_ADDR environment variable not set")
	}

	config := &api.Config{Address: vaultAddr}
	var err error
	VaultClient, err = api.NewClient(config)
	if err != nil {
		log.Fatalf("Failed to initialize Vault client: %v", err)
	}

	vaultToken := os.Getenv("VAULT_TOKEN")
	if vaultToken == "" {
		log.Fatal("VAULT_TOKEN environment variable not set")
	}
	VaultClient.SetToken(vaultToken)

	log.Println("Vault client initialized successfully.")
}

// WriteSecret writes a secret to Vault under the specified path and returns the path.
func WriteSecret(projectID, key, secretValue string) (string, error) {
	secretPath := "secret/data/" + projectID + "/" + key
	data := map[string]interface{}{
		"data": map[string]interface{}{
			"value": secretValue,
		},
	}

	_, err := VaultClient.Logical().Write(secretPath, data)
	if err != nil {
		log.Printf("Failed to write secret to Vault: %v", err)
		return "", err
	}

	return secretPath, nil
}

// ReadSecret retrieves a secret value from a given path in Vault.
func ReadSecret(path string) (string, error) {
	secret, err := VaultClient.Logical().Read(path)
	if err != nil {
		return "", fmt.Errorf("failed to read secret from Vault: %v", err)
	}
	if secret == nil || secret.Data == nil {
		return "", fmt.Errorf("secret not found at path: %s", path)
	}

	secretData, ok := secret.Data["data"].(map[string]interface{})
	if !ok || secretData["value"] == nil {
		return "", fmt.Errorf("secret value not found at path: %s", path)
	}

	valueStr, ok := secretData["value"].(string)
	if !ok {
		return "", fmt.Errorf("secret value is not a string")
	}

	return valueStr, nil
}
