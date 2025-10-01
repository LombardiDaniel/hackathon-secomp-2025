package services

import (
	"context"
	"fmt"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/models"
	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"
)

type ElasticService interface {
	InsertRoadmap(ctx context.Context, roadmap models.Roadmap, prompt string) error
	SearchRoadmaps(ctx context.Context, query string) (string, error)
}

type ElasticServiceImpl struct {
	client *elasticsearch.TypedClient
	index  string
}

func NewElasticServiceImpl(es *elasticsearch.TypedClient) ElasticService {
	return &ElasticServiceImpl{
		client: es,
		index:  "roadmaps",
	}
}

func (s *ElasticServiceImpl) InsertRoadmap(ctx context.Context, roadmap models.Roadmap, prompt string) error {
	doc := models.Search{
		Title:     roadmap.Title,
		Prompt:    prompt,
		Category:  roadmap.Description,
		Dificulty: roadmap.Difficulty,
		// Modules:       roadmap.Modules,
		EstimatedTime: fmt.Sprint(roadmap.EstimatedTotalMinutes),
	}

	s.client.Index(s.index).Request(doc).Do(ctx)
	return nil
}

func (s *ElasticServiceImpl) SearchRoadmaps(ctx context.Context, query string) (string, error) {
	resp, err := s.client.Search().Index(s.index).
		Request(&search.Request{
			Query: &types.Query{
				MultiMatch: &types.MultiMatchQuery{
					Query:  query,
					Fields: []string{"title", "prompt", "category", "dificulty", "modules"},
				},
			},
		}).Do(ctx)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%v", resp), nil
}
