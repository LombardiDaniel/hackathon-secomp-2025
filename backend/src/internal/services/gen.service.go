package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/dto"
)

type GenService interface {
	GenerateRoadmap(ctx context.Context, prompt string) (dto.Roadmap, error)
}

type GenServiceImpl struct {
	AppPyURL string
}

func NewGenServiceImpl(appPyURL string) GenService {
	return &GenServiceImpl{AppPyURL: appPyURL}
}

func (g *GenServiceImpl) GenerateRoadmap(ctx context.Context, prompt string) (dto.Roadmap, error) {
	reqBody := map[string]string{"prompt": prompt}
	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return dto.Roadmap{}, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", g.AppPyURL+"/receber", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return dto.Roadmap{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 1 * time.Minute}
	resp, err := client.Do(req)
	if err != nil {
		return dto.Roadmap{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return dto.Roadmap{}, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var roadmap dto.Roadmap
	if err := json.NewDecoder(resp.Body).Decode(&roadmap); err != nil {
		return dto.Roadmap{}, err
	}

	return roadmap, nil
}
