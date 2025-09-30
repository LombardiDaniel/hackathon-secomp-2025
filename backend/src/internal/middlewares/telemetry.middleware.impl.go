package middlewares

import (
	"fmt"
	"time"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/services"
	"github.com/gin-gonic/gin"
)

type TelemetryMiddlewareImpl struct {
	telemetryService services.TelemetryService
}

func NewTelemetryMiddleware(telemetryService services.TelemetryService) TelemetryMiddleware {
	return &TelemetryMiddlewareImpl{
		telemetryService: telemetryService,
	}
}

func (m *TelemetryMiddlewareImpl) CollectApiCalls() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)

		m.telemetryService.RecordMetric(
			c.Request.Context(),
			"api_call_duration",
			duration.Seconds(),
			map[string]string{
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
				"status": fmt.Sprintf("%d", c.Writer.Status()),
			},
		)
	}
}

func (m *TelemetryMiddlewareImpl) LogUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		email, ok := c.Params.Get("email")
		if !ok {
			c.Next()
			return
		}

		m.telemetryService.RecordEvent(
			c.Request.Context(),
			"user_log",
			map[string]any{
				"logged": true,
				"email":  email,
			},
			map[string]string{},
		)
	}
}
