package rag

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type AzureSearchClient interface {
	SearchRelevantChunks(ctx context.Context, req *ConsultationRequest) ([]string, error)
}

type ConsultationRequest struct {
	ER             int
	PR             int
	HER2           int
	Ki67           int
	TNM            string
	HistologicType string
	Stage          string
}

type azureSearch struct {
	endpoint   string
	apiKey     string
	httpClient *http.Client
}

func NewAzureSearchClient() AzureSearchClient {
	return &azureSearch{
		endpoint: os.Getenv("AZURE_SEARCH_ENDPOINT"),
		apiKey:   os.Getenv("AZURE_SEARCH_API_KEY"),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (a *azureSearch) SearchRelevantChunks(ctx context.Context, req *ConsultationRequest) ([]string, error) {
	queryVector := []float64{
		float64(req.ER),
		float64(req.PR),
		float64(req.HER2),
		float64(req.Ki67),
	}

	body := map[string]interface{}{
		"vector":      queryVector,
		"topK":        5,
		"includeText": true,
		"filter":      fmt.Sprintf("HistologicType eq '%s' and Stage eq '%s'", req.HistologicType, req.Stage),
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to encode search payload: %w", err)
	}

	reqURL := fmt.Sprintf("%s/indexes/%s/docs/search?api-version=2021-04-30-Preview",
		a.endpoint, "oncology-guidelines-index")

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to create search request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("api-key", a.apiKey)

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to perform search request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("search request failed: %s", resp.Status)
	}

	var result struct {
		Value []struct {
			Text string `json:"text"`
		} `json:"value"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode search response: %w", err)
	}

	var chunks []string
	for _, doc := range result.Value {
		chunks = append(chunks, doc.Text)
	}

	return chunks, nil
}
