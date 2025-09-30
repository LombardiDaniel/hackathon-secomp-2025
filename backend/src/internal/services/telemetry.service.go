package services

import (
	"context"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/models"
)

// TelemetryService defines the interface for storing and retrieving telemetry data.
type TelemetryService interface {
	// RecordEvent logs a specific event with associated metadata.
	RecordEvent(ctx context.Context, eventName string, metadata map[string]any, tags map[string]string) error

	// RecordMetric logs a numerical metric with a value and optional tags.
	RecordMetric(ctx context.Context, metricName string, value float64, tags map[string]string) error

	// Upload uploads telemetry the enqueued data. This method should be called
	// in a separate goroutine to avoid blocking. Should panic if impl is not async.
	Upload() error

	GetEvents(ctx context.Context, filter any) ([]models.Event, error)
}
