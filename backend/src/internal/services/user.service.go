package services

import (
	"context"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserService interface {
	Users(ctx context.Context) ([]models.User, error)
}

type UserServiceImpl struct {
	mongoClient *mongo.Client
	usersCol    *mongo.Collection
}

func NewUserServiceImpl(mongoClient *mongo.Client, usersCol *mongo.Collection) UserService {
	return &UserServiceImpl{
		mongoClient: mongoClient,
		usersCol:    usersCol,
	}
}

func (s *UserServiceImpl) Users(ctx context.Context) ([]models.User, error) {
	cur, err := s.usersCol.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var users []models.User
	for cur.Next(ctx) {
		var user models.User
		if err := cur.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return users, nil
}
