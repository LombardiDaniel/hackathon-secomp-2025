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

	elasticsearch "github.com/elastic/go-elasticsearch/v8"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/docs"
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
)

var (
	ctx    context.Context
	router *gin.Engine

	userService      services.UserService
	roadmapService   services.RoadmapService
	emailService     services.EmailService
	objectService    services.ObjectService
	telemetryService services.TelemetryService
	genService       services.GenService
	searchService    services.ElasticService

	telemetryMiddleware middlewares.TelemetryMiddleware

	roadmapHandler handlers.RoadmapHandler

	taskRunner daemons.TaskRunner
)

func init() {
	logger.InitSlogger()
	ctx = context.Background()

	cfg := elasticsearch.Config{
		Addresses: []string{"https://elastic.roady.patos.dev/"},
	}
	es, err := elasticsearch.NewTypedClient(cfg)
	if err != nil {
		panic(err)
	}

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
	roadmapsCol := mongoClient.Database("roadmaps").Collection("roadmaps")
	usersCol := mongoClient.Database("roadmaps").Collection("users")

	it.Must(metricsCol.Indexes().CreateOne(ctx, tsIdxModel))
	it.Must(eventsCol.Indexes().CreateOne(ctx, tsIdxModel))
	it.Must(usersCol.Indexes().CreateOne(
		ctx,
		mongo.IndexModel{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	))

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

	if os.Getenv("RESEND_API_KEY") == "mock" {
		emailService = &services.EmailServiceMock{}
	} else {
		emailService = services.NewEmailServiceResendImpl(os.Getenv("RESEND_API_KEY"), "internal/templates")
	}
	objectService = services.NewObjectServiceMinioImpl(minioClient)
	telemetryService = services.NewTelemetryServiceMongoAsyncImpl(mongoClient, metricsCol, eventsCol, 100)
	services.NewUserServiceImpl(mongoClient, usersCol)
	roadmapService = services.NewRoadmapServiceImpl(mongoClient, roadmapsCol)
	genService = services.NewGenServiceImpl("https://elastic.roady.patos.dev/")
	searchService = services.NewElasticServiceImpl(es)

	telemetryMiddleware = middlewares.NewTelemetryMiddleware(telemetryService)

	roadmapHandler = handlers.NewRoadmapHandler(roadmapService, genService, searchService)

	router = gin.Default()
	router.SetTrustedProxies([]string{"*"})

	corsCfg := cors.DefaultConfig()
	// corsCfg.AllowOrigins = []string{constants.ApiHostUrl, constants.AppHostUrl}
	corsCfg.AllowAllOrigins = true
	corsCfg.AllowCredentials = true
	// corsCfg.AllowCredentials = true
	// corsCfg.AddAllowHeaders("Authorization")
	// corsCfg.MaxAge = 24 * time.Hour

	slog.Info(fmt.Sprintf("corsCfg: %+v", corsCfg))

	router.Use(cors.New(corsCfg))
	router.Use(limits.RequestSizeLimiter(constants.MaxRequestSize))

	docs.SwaggerInfo.Title = "roady"
	docs.SwaggerInfo.Description = "roady"
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
	taskRunner.RegisterTask(
		12*time.Hour,
		func() error {
			ctx := context.TODO()
			users, err := userService.Users(ctx)
			if err != nil {
				return err
			}

			now := time.Now()
			startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
			endOfDay := startOfDay.Add(24 * time.Hour)

			for _, u := range users {
				evs, err := telemetryService.GetEvents(ctx,
					bson.M{
						"name": "user_log",
						"metadata": bson.M{
							"logged": true,
							"email":  u.Email,
						},
						"ts": bson.M{
							"$gte": startOfDay,
							"$lt":  endOfDay,
						},
					},
				)
				if err != nil {
					continue
				}

				if len(evs) == 0 {
					err = emailService.SendReminder(u.Email, "", "")
					if err != nil {
						slog.Error(err.Error())
					}
				}
			}
			return nil
		},
		1,
	)
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
	roadmapHandler.RegisterRoutes(basePath, telemetryMiddleware)

	taskRunner.Dispatch()

	slog.Error(router.Run(":8080").Error())
}
