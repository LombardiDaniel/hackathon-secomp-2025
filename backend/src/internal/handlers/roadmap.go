package handlers

import (
	"net/http"

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
// @Success 200 {array} models.Roadmap
// @Failure 502 string BadGateway
// @Router /v1/roadmaps [GET]
func (h *RoadmapHandler) Roadmaps(ctx *gin.Context) {
	roadmaps, err := h.roadmapService.Roadmaps(ctx)
	if err != nil {
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}
	ctx.JSON(http.StatusOK, roadmaps)
}

// @Summary Get roadmap by ID
// @Tags Roadmap
// @Produce json
// @Param roadmapId path string true "Roadmap ID"
// @Success 200 {object} models.Roadmap
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
	ctx.JSON(http.StatusOK, roadmap)
}

// @Summary Get roadmaps from user
// @Tags Roadmap
// @Produce json
// @Param email query string true "User Email"
// @Success 200 {array} models.Roadmap
// @Failure 502 string BadGateway
// @Router /v1/roadmaps/user [GET]
func (h *RoadmapHandler) RoadmapsFromUser(ctx *gin.Context) {
	email := ctx.Query("email")
	roadmaps, err := h.roadmapService.RoadmapsFromUser(ctx, email)
	if err != nil {
		ctx.String(http.StatusBadGateway, "BadGateway")
		return
	}
	ctx.JSON(http.StatusOK, roadmaps)
}

// RegisterRoutes registers roadmap endpoints
func (h *RoadmapHandler) RegisterRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/roadmaps")
	g.GET("", h.Roadmaps)
	g.GET("/:roadmapId", h.Roadmap)
	g.GET("/user", h.RoadmapsFromUser)
}
