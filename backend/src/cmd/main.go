package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/handlers"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/middlewares"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/services"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/pkg/common"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/pkg/constants"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/pkg/daemons"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/pkg/it"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/pkg/logger"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"github.com/gin-contrib/cors"
	limits "github.com/gin-contrib/size"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/swaggo/swag/example/basic/docs"
)

var (
	ctx    context.Context
	router *gin.Engine

	// authService      services.AuthService
	// userService      services.UserService
	roadmapService   services.RoadmapService
	emailService     services.EmailService
	objectService    services.ObjectService
	telemetryService services.TelemetryService

	telemetryMiddleware middlewares.TelemetryMiddleware

	// authHandler handlers.AuthHandler
	// userHandler handlers.UserHandler
	roadmapHandler handlers.RoadmapHandler

	taskRunner daemons.TaskRunner
)

func init() {
	logger.InitSlogger()
	ctx = context.Background()

	mongoConn := options.Client().ApplyURI(
		common.GetEnvVarDefault("MONGO_URI", "mongodb://localhost:27017"),
	)
	mongoClient := it.Must(mongo.Connect(ctx, mongoConn))
	if err := mongoClient.Ping(ctx, readpref.Primary()); err != nil {
		panic(errors.Join(err, errors.New("could not ping mongodb")))
	}

	tsIdxModel := mongo.IndexModel{
		Keys:    bson.M{"ts": 1},
		Options: options.Index(),
	}
	metricsCol := mongoClient.Database("telemetry").Collection("metrics")
	eventsCol := mongoClient.Database("telemetry").Collection("events")
	roadmapsCol := mongoClient.Database("roadmaps").Collection("events")
	it.Must(metricsCol.Indexes().CreateOne(ctx, tsIdxModel))
	it.Must(eventsCol.Indexes().CreateOne(ctx, tsIdxModel))

	s3Host := it.Must(common.ExtractHostFromUrl(constants.S3Endpoint))
	s3Secure := it.Must(common.UrlIsSecure(constants.S3Endpoint))
	minioClient := it.Must(minio.New(
		s3Host,
		&minio.Options{
			Creds: credentials.NewStaticV4(
				os.Getenv("S3_ACCESS_KEY_ID"),
				os.Getenv("S3_SECRET_ACCESS_KEY"),
				"",
			),
			Region: constants.S3Region,
			Secure: s3Secure,
		},
	))

	// authService = services.NewAuthServiceJwtImpl(os.Getenv("JWT_SECRET_KEY"), db)
	// userService = services.NewUserServicePgImpl(db)
	if os.Getenv("RESEND_API_KEY") == "mock" {
		emailService = &services.EmailServiceMock{}
	} else {
		emailService = services.NewEmailServiceResendImpl(os.Getenv("RESEND_API_KEY"), "internal/templates")
	}
	objectService = services.NewObjectServiceMinioImpl(minioClient)
	telemetryService = services.NewTelemetryServiceMongoAsyncImpl(mongoClient, metricsCol, eventsCol, 100)
	roadmapService = services.NewRoadmapServiceImpl(mongoClient, roadmapsCol)

	telemetryMiddleware = middlewares.NewTelemetryMiddleware(telemetryService)

	roadmapHandler = handlers.NewRoadmapHandler(roadmapService)

	router = gin.Default()
	router.SetTrustedProxies([]string{"*"})

	corsCfg := cors.DefaultConfig()
	corsCfg.AllowOrigins = []string{constants.ApiHostUrl, constants.AppHostUrl}
	corsCfg.AllowCredentials = true
	corsCfg.AddAllowHeaders("Authorization")
	corsCfg.MaxAge = 24 * time.Hour

	slog.Info(fmt.Sprintf("corsCfg: %+v", corsCfg))

	router.Use(cors.New(corsCfg))
	router.Use(limits.RequestSizeLimiter(constants.MaxRequestSize))

	docs.SwaggerInfo.Title = "Goliath"
	docs.SwaggerInfo.Description = "Goliath"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.BasePath = ""
	docs.SwaggerInfo.Host = strings.Split(constants.ApiHostUrl, "://")[1]

	if os.Getenv("GIN_MODE") == "release" {
		docs.SwaggerInfo.Schemes = []string{"https"}
	} else {
		docs.SwaggerInfo.Schemes = []string{"http"}
	}

	router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/docs", func(ctx *gin.Context) {
		ctx.Header("location", "/docs/index.html")
		ctx.String(http.StatusMovedPermanently, "MovedPermanently")
	})

	// Daemons
	// taskRunner.RegisterTask(24*time.Hour, userService.DeleteExpiredPwResets, 1)
	// taskRunner.RegisterTask(24*time.Hour, organizationService.DeleteExpiredOrgInvites, 1)
	taskRunner.RegisterTask(time.Second, telemetryService.Upload, 1)
}

// @securityDefinitions.apiKey JWT
// @in cookie
// @name Authorization
// @description JWT
// @securityDefinitions.apiKey Bearer
// @in header
// @name Authorization
// @description "Type 'Bearer $TOKEN' to correctly set the API Key"
func main() {

	// LB healthcheck
	router.GET("/", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "OK")
	})

	router.Use(telemetryMiddleware.CollectApiCalls())

	basePath := router.Group("/v1")
	roadmapHandler.RegisterRoutes(basePath)

	taskRunner.Dispatch()

	slog.Error(router.Run(":8080").Error())
}
