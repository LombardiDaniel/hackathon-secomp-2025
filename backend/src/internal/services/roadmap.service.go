package services

import (
	"context"
	"math/rand"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/dto"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type RoadmapService interface {
	Roadmaps(ctx context.Context) ([]models.Roadmap, error)
	Roadmap(ctx context.Context, roadmapId string) (models.Roadmap, error)
	RoadmapsFromUser(ctx context.Context, email string) ([]models.Roadmap, error)

	Insert(ctx context.Context, email string, roadmap dto.Roadmap) (models.Roadmap, error)
}

type RoadmapServiceImpl struct {
	mongoClient *mongo.Client
	roadmapsCol *mongo.Collection
}

func NewRoadmapServiceImpl(mongoClient *mongo.Client, roadmapsCol *mongo.Collection) RoadmapService {
	return &RoadmapServiceImpl{
		mongoClient: mongoClient,
		roadmapsCol: roadmapsCol,
	}
}

func (s *RoadmapServiceImpl) Roadmaps(ctx context.Context) ([]models.Roadmap, error) {
	opts := options.Find().SetSort(bson.M{"upvotes": -1})
	cur, err := s.roadmapsCol.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var roadmaps []models.Roadmap
	for cur.Next(ctx) {
		var roadmap models.Roadmap
		if err := cur.Decode(&roadmap); err != nil {
			return nil, err
		}
		roadmaps = append(roadmaps, roadmap)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return roadmaps, nil
}

func (s *RoadmapServiceImpl) Roadmap(ctx context.Context, roadmapId string) (models.Roadmap, error) {
	objID, err := primitive.ObjectIDFromHex(roadmapId)
	if err != nil {
		return models.Roadmap{}, err
	}
	var roadmap models.Roadmap
	err = s.roadmapsCol.FindOne(ctx, bson.M{"_id": objID}).Decode(&roadmap)
	return roadmap, err
}

func (s *RoadmapServiceImpl) RoadmapsFromUser(ctx context.Context, email string) ([]models.Roadmap, error) {
	opts := options.Find().SetSort(bson.M{"upvotes": -1})
	cur, err := s.roadmapsCol.Find(ctx, bson.M{"userEmail": email}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var roadmaps []models.Roadmap
	for cur.Next(ctx) {
		var roadmap models.Roadmap
		if err := cur.Decode(&roadmap); err != nil {
			return nil, err
		}
		roadmaps = append(roadmaps, roadmap)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return roadmaps, nil
}

func (s *RoadmapServiceImpl) Insert(ctx context.Context, email string, roadmap dto.Roadmap) (models.Roadmap, error) {
	rm := models.Roadmap{
		ID:                    primitive.NewObjectID(),
		Upvotes:               rand.Int() % 10_000_000,
		UserEmail:             email,
		SchemaVersion:         roadmap.SchemaVersion,
		Title:                 roadmap.Title,
		Description:           roadmap.Description,
		Difficulty:            roadmap.Difficulty,
		EstimatedTotalMinutes: roadmap.EstimatedTotalMinutes,
		Tags:                  roadmap.Tags,
		Modules:               roadmap.Modules,
		Nodes:                 roadmap.Nodes,
	}
	_, err := s.roadmapsCol.InsertOne(ctx, rm)
	return rm, err
}
