package handlers

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/dto"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/middlewares"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/services"
	"github.com/gin-gonic/gin"
)

type RoadmapHandler struct {
	roadmapService services.RoadmapService
	genService     services.GenService
	searchService  services.ElasticService
}

func NewRoadmapHandler(roadmapService services.RoadmapService, genService services.GenService, searchService services.ElasticService) RoadmapHandler {
	return RoadmapHandler{
		roadmapService: roadmapService,
		genService:     genService,
		searchService:  searchService,
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

// @Summary Insert Roadmap
// @Tags Roadmap
// @Produce json
// @Param email query string true "User Email"
// @Param prompt query string true "The Prompt"
// @Success 200 string RoadmapID
// @Failure 502 string BadGateway
// @Router /v1/roadmaps [POST]
func (h *RoadmapHandler) Insert(ctx *gin.Context) {
	email := ctx.Query("email")
	prompt := ctx.Query("prompt")

	slog.Info(fmt.Sprintf("insert: %s: %s", email, prompt))

	roadmap, err := h.genService.GenerateRoadmap(ctx, prompt)
	if err != nil {
		slog.Error(err.Error())
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}

	rd, err := h.roadmapService.Insert(ctx, email, roadmap)
	if err != nil {
		slog.Error(err.Error())
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}

	err = h.searchService.InsertRoadmap(ctx, rd, prompt)
	if err != nil {
		slog.Error(err.Error())
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}
	ctx.String(http.StatusOK, roadmap.ID)
}

// @Summary Searches Roadmap
// @Tags Roadmap
// @Produce json
// @Param query path string true "Search query"
// @Success 200 string RoadmapID
// @Failure 502 string BadGateway
// @Router /v1/roadmaps/search/{query} [GET]
func (h *RoadmapHandler) Search(ctx *gin.Context) {
	query := ctx.Param("query")
	s, err := h.searchService.SearchRoadmaps(ctx, query)
	if err != nil {
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}
	ctx.String(200, s)
}

// RegisterRoutes registers roadmap endpoints
func (h *RoadmapHandler) RegisterRoutes(rg *gin.RouterGroup, telemetryMiddleware middlewares.TelemetryMiddleware) {
	g := rg.Group("/roadmaps")
	g.GET("", telemetryMiddleware.LogUser(), h.Roadmaps)
	g.GET("/:roadmapId", telemetryMiddleware.LogUser(), h.Roadmap)
	g.GET("/user", telemetryMiddleware.LogUser(), h.RoadmapsFromUser)
	g.POST("", telemetryMiddleware.LogUser(), h.Insert)
	g.GET("/search/:query", telemetryMiddleware.LogUser(), h.Search)
}
