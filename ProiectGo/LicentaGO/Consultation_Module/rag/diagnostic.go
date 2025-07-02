package rag

import (
	"context"
	"fmt"
	"log"
)

type ConsultationRequestLocal struct {
	ER             int
	PR             int
	HER2           int
	Ki67           int
	TNM            string
	HistologicType string
	Stage          string
}

type DiagnosticService interface {
	DetermineDiagnostic(ctx context.Context, req *ConsultationRequest) (*DiagnosticResult, error)
}

type ragService struct {
	searchClient AzureSearchClient
	llmClient    LLMClient
}

func NewDiagnosticService(searchClient AzureSearchClient, llmClient LLMClient) DiagnosticService {
	return &ragService{
		searchClient: searchClient,
		llmClient:    llmClient,
	}
}

func ComposePrompt(req *ConsultationRequest, chunks []string) string {
	prompt := `You are a specialized medical oncology assistant. 
	Your task is to analyze the patient’s breast cancer biomarker profile and staging information 
	together with the retrieved clinical guideline context.

	Based on this information, you must:
	1. Determine the most appropriate diagnostic subtype 
	(for example: Luminal A, Luminal B HER2 negative, Luminal B HER2 positive, Triple Negative Breast Cancer).
	2. Provide the recommended ESMO treatment guidelines related to this subtype.

	Always return your output as a single, well-formatted JSON object with the following structure:

	{
	"diagnostic": "<string>",
	"esmo_guidelines": {
		"firstLineTreatment": {
		"title": "<string>",
		"items": [
			{
			"titleItem": "<string>",
			"indication": "<string>",
			"alternativeIndication": "<string, optional>"
			}
		]
		},
		"diseaseProgression": {
		"title": "<string>",
		"items": [
			{
			"titleItem": "<string>",
			"indication": "<string>",
			"alternativeIndication": "<string, optional>"
			}
		]
		}
	}
	}

	Do not include any extra text or commentary. Output only valid JSON.`

	prompt += "Patient Data:\n"
	prompt += fmt.Sprintf("ER: %d\n", req.ER)
	prompt += fmt.Sprintf("PR: %d\n", req.PR)
	prompt += fmt.Sprintf("HER2: %d\n", req.HER2)
	prompt += fmt.Sprintf("Ki67: %d\n", req.Ki67)
	prompt += fmt.Sprintf("TNM: %s\n", req.TNM)
	prompt += fmt.Sprintf("Histologic Type: %s\n", req.HistologicType)
	prompt += fmt.Sprintf("Stage: %s\n", req.Stage)
	prompt += "\n"

	prompt += "Retrieved Context:\n"
	for _, chunk := range chunks {
		prompt += fmt.Sprintf("- %s\n", chunk)
	}

	prompt += "\nReturn JSON in this format:\n" +
		`{
  "diagnostic": "string",
  "esmo_guidelines": {
    "firstLineTreatment": {...},
    "diseaseProgression": {...}
  }
}`

	return prompt
}

func (r *ragService) DetermineDiagnostic(ctx context.Context, req *ConsultationRequest) (*DiagnosticResult, error) {
	chunks, err := r.searchClient.SearchRelevantChunks(ctx, req)
	if err != nil {
		log.Printf("Azure Search failed: %v", err)
		return nil, err
	}

	prompt := ComposePrompt(req, chunks)

	response, err := r.llmClient.GenerateDiagnostic(ctx, prompt)
	if err != nil {
		return nil, err
	}

	return response, nil
}
