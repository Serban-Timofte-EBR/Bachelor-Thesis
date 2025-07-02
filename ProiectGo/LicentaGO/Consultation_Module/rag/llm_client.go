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

type LLMClient interface {
	GenerateDiagnostic(ctx context.Context, prompt string) (*DiagnosticResult, error)
}

type llmClient struct {
	endpoint   string
	apiKey     string
	httpClient *http.Client
}

func NewLLMClient() LLMClient {
	return &llmClient{
		endpoint: os.Getenv("AZURE_OPENAI_ENDPOINT"),
		apiKey:   os.Getenv("AZURE_OPENAI_API_KEY"),
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

type openAIRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func (l *llmClient) GenerateDiagnostic(ctx context.Context, prompt string) (*DiagnosticResult, error) {
	requestBody := openAIRequest{
		Model: "gpt-4o",
		Messages: []Message{
			{
				Role:    "system",
				Content: "You are a medical oncology assistant.",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	payload, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal LLM request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, l.endpoint+"/v1/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to create LLM request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", l.apiKey)

	resp, err := l.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("LLM request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("LLM returned non-200: %s", resp.Status)
	}

	var aiResp openAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
		return nil, fmt.Errorf("failed to decode LLM response: %w", err)
	}

	if len(aiResp.Choices) == 0 {
		return nil, fmt.Errorf("LLM response has no choices")
	}

	var result DiagnosticResult
	if err := json.Unmarshal([]byte(aiResp.Choices[0].Message.Content), &result); err != nil {
		return nil, fmt.Errorf("failed to parse JSON from LLM output: %w", err)
	}

	return &result, nil
}
