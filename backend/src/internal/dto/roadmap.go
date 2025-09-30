package dto

import "github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/models"

type Roadmap struct {
	ID                    string           `json:"id"`
	Upvotes               int              `json:"upvotes"`
	UserEmail             string           `json:"userEmail"`
	SchemaVersion         int              `json:"schemaVersion"`
	Title                 string           `json:"title"`
	Description           string           `json:"description"`
	Difficulty            string           `json:"difficulty"`
	EstimatedTotalMinutes int              `json:"estimatedTotalMinutes"`
	Tags                  []string         `json:"tags"`
	Modules               []models.Modules `json:"modules"`
	Nodes                 []models.Nodes   `json:"nodes"`
}
