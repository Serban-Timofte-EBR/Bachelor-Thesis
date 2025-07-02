package rag

type DiagnosticResult struct {
	Diagnostic     string                 `json:"diagnostic"`
	ESMOGuidelines map[string]interface{} `json:"esmo_guidelines"`
}
