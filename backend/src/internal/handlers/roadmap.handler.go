package handlers

import (
	"net/http"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/dto"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/middlewares"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/services"
	"github.com/gin-gonic/gin"
)

type RoadmapHandler struct {
	roadmapService services.RoadmapService
}

func NewRoadmapHandler(roadmapService services.RoadmapService) RoadmapHandler {
	return RoadmapHandler{
		roadmapService: roadmapService,
	}
}

// @Summary Get all roadmaps
// @Tags Roadmap
// @Produce json
// @Success 200 {array} dto.Roadmap
// @Failure 502 string BadGateway
// @Router /v1/roadmaps [GET]
func (h *RoadmapHandler) Roadmaps(ctx *gin.Context) {
	roadmaps, err := h.roadmapService.Roadmaps(ctx)
	if err != nil {
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}
	rets := []dto.Roadmap{}
	for _, roadmap := range roadmaps {
		rets = append(rets, dto.Roadmap{
			ID:                    roadmap.ID.Hex(),
			Upvotes:               roadmap.Upvotes,
			UserEmail:             roadmap.UserEmail,
			SchemaVersion:         roadmap.SchemaVersion,
			Title:                 roadmap.Title,
			Description:           roadmap.Description,
			Difficulty:            roadmap.Difficulty,
			EstimatedTotalMinutes: roadmap.EstimatedTotalMinutes,
			Tags:                  roadmap.Tags,
			Modules:               roadmap.Modules,
			Nodes:                 roadmap.Nodes,
		})
	}
	ctx.JSON(http.StatusOK, rets)
}

// @Summary Get roadmap by ID
// @Tags Roadmap
// @Produce json
// @Param roadmapId path string true "Roadmap ID"
// @Success 200 {object} dto.Roadmap
// @Failure 404 string NotFound
// @Failure 502 string BadGateway
// @Router /v1/roadmaps/{roadmapId} [GET]
func (h *RoadmapHandler) Roadmap(ctx *gin.Context) {
	roadmapId := ctx.Param("roadmapId")
	roadmap, err := h.roadmapService.Roadmap(ctx, roadmapId)
	if err != nil {
		ctx.String(http.StatusNotFound, "NotFound")
		return
	}
	ret := dto.Roadmap{
		ID:                    roadmap.ID.Hex(),
		Upvotes:               roadmap.Upvotes,
		UserEmail:             roadmap.UserEmail,
		SchemaVersion:         roadmap.SchemaVersion,
		Title:                 roadmap.Title,
		Description:           roadmap.Description,
		Difficulty:            roadmap.Difficulty,
		EstimatedTotalMinutes: roadmap.EstimatedTotalMinutes,
		Tags:                  roadmap.Tags,
		Modules:               roadmap.Modules,
		Nodes:                 roadmap.Nodes,
	}
	ctx.JSON(http.StatusOK, ret)
}

// @Summary Get roadmaps from user
// @Tags Roadmap
// @Produce json
// @Param email query string true "User Email"
// @Success 200 {array} dto.Roadmap
// @Failure 502 string BadGateway
// @Router /v1/roadmaps/user [GET]
func (h *RoadmapHandler) RoadmapsFromUser(ctx *gin.Context) {
	email := ctx.Query("email")
	roadmaps, err := h.roadmapService.RoadmapsFromUser(ctx, email)
	if err != nil {
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}
	rets := []dto.Roadmap{}
	for _, roadmap := range roadmaps {
		rets = append(rets, dto.Roadmap{
			ID:                    roadmap.ID.Hex(),
			Upvotes:               roadmap.Upvotes,
			UserEmail:             roadmap.UserEmail,
			SchemaVersion:         roadmap.SchemaVersion,
			Title:                 roadmap.Title,
			Description:           roadmap.Description,
			Difficulty:            roadmap.Difficulty,
			EstimatedTotalMinutes: roadmap.EstimatedTotalMinutes,
			Tags:                  roadmap.Tags,
			Modules:               roadmap.Modules,
			Nodes:                 roadmap.Nodes,
		})
	}
	ctx.JSON(http.StatusOK, rets)
}

// RegisterRoutes registers roadmap endpoints
func (h *RoadmapHandler) RegisterRoutes(rg *gin.RouterGroup, telemetryMiddleware middlewares.TelemetryMiddleware) {
	g := rg.Group("/roadmaps")
	g.GET("", telemetryMiddleware.LogUser(), h.Roadmaps)
	g.GET("/:roadmapId", telemetryMiddleware.LogUser(), h.Roadmap)
	g.GET("/user", telemetryMiddleware.LogUser(), h.RoadmapsFromUser)
}
