package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Roadmap struct {
	ID                    primitive.ObjectID `json:"id" bson:"_id"`
	Upvotes               int                `json:"upvotes"`
	UserEmail             string             `json:"userEmail"`
	SchemaVersion         int                `json:"schemaVersion"`
	Title                 string             `json:"title"`
	Description           string             `json:"description"`
	Difficulty            string             `json:"difficulty"`
	EstimatedTotalMinutes int                `json:"estimatedTotalMinutes"`
	Tags                  []string           `json:"tags"`
	Modules               []Modules          `json:"modules"`
	Nodes                 []Nodes            `json:"nodes"`
}

type Modules struct {
	ID      string   `json:"id"`
	Title   string   `json:"title"`
	Order   int      `json:"order"`
	Summary string   `json:"summary"`
	NodeIds []string `json:"nodeIds"`
}

type Nodes struct {
	ID               string `json:"id"`
	ModuleID         string `json:"moduleId"`
	Title            string `json:"title"`
	Objective        string `json:"objective"`
	EstimatedMinutes int    `json:"estimatedMinutes"`
	Difficulty       string `json:"difficulty"`
	PrereqNodeIds    []any  `json:"prereqNodeIds"`
}
