package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"github.com/Azure/azure-storage-blob-go/azblob"
	"github.com/google/uuid"
)

func UploadFileToBlobStorage(containerName string, originalFileName string, file multipart.File) (string, error) {

	uniqueFileName := generateUniqueFileName(originalFileName)

	accountName := os.Getenv("AZURE_STORAGE_ACCOUNT_NAME")
	accountKey := os.Getenv("AZURE_STORAGE_ACCOUNT_KEY")

	// Create a credential using the shared key
	credential, err := azblob.NewSharedKeyCredential(accountName, accountKey)
	if err != nil {
		return "", fmt.Errorf("error creating Azure credential: %v", err)
	}

	p := azblob.NewPipeline(credential, azblob.PipelineOptions{})

	URL, _ := url.Parse(fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s", accountName, containerName, uniqueFileName))

	blockBlobURL := azblob.NewBlockBlobURL(*URL, p)

	// Upload the file
	ctx := context.Background()
	_, err = azblob.UploadStreamToBlockBlob(ctx, file, blockBlobURL,
		azblob.UploadStreamToBlockBlobOptions{
			BufferSize: 4 * 1024 * 1024,
			MaxBuffers: 16,
		})

	if err != nil {
		return "", fmt.Errorf("error uploading file to Azure Storage: %v", err)
	}

	// Return the URL of the uploaded blob
	return blockBlobURL.String(), nil
}

func generateUniqueFileName(originalFileName string) string {
	// Get the file extension
	ext := filepath.Ext(originalFileName)

	// Generate a UUID
	id := uuid.New().String()

	// Get the current timestamp
	timestamp := time.Now().Format("20060102-150405")

	// Combine all parts to create a unique filename
	return fmt.Sprintf("%s-%s%s", timestamp, id, ext)
}
