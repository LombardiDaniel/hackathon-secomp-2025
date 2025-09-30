package services

import "github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/dto"

type GenService interface {
	GenerateRoadmap(prompt string) (dto.Roadmap, error)
}
