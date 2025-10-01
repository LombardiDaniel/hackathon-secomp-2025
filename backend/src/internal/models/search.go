package models

type Search struct {
	Title         string
	Prompt        string
	Category      string
	Dificulty     string
	Modules       []string
	EstimatedTime string `json:"estimatedTime"`
}
