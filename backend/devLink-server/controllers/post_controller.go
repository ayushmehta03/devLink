package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/ayushmehta03/devLink-backend/database"
	"github.com/ayushmehta03/devLink-backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func CreatePost(client *mongo.Client) gin.HandlerFunc{
	return func(c *gin.Context ){


		userId,exists:=c.Get("user_id")

		if !exists{
			c.JSON(http.StatusUnauthorized,gin.H{"error":"Unauthorized"})
			return 
		}

		var post models.Post

		if err:=c.ShouldBindJSON(&post);err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid input"})
			return 
		}

		post.ID=bson.NewObjectID()
		post.AuthorID,_=bson.ObjectIDFromHex(userId.(string))
		post.Slug=strings.ToLower(strings.ReplaceAll(post.Title," ","-"))
		post.ViewCount=0
		post.CreatedAt=time.Now()
		post.UpdatedAt=time.Now()


		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()

		collection:=database.OpenCollection("posts",client)

		_,err:=collection.InsertOne(ctx,post)

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to create post"})
			return 
		}

		c.JSON(http.StatusCreated,gin.H{"message":"Post created successfully",
	})

	}
}


func GetAllPosts(client *mongo.Client) gin.HandlerFunc{
	return func(c *gin.Context){

		ctx,cancel:=context.WithTimeout(context.Background(),time.Second)

		defer cancel();

		collection:=database.OpenCollection("posts",client)


		filter:=bson.M{
			"published":true,
		}

		opts:=options.Find().SetSort(bson.M{"created_at":-1})


		cursor,err:=collection.Find(ctx,filter,opts)

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to fetch posts"})
			return 
		}
		defer cursor.Close(ctx)


		var posts []models.Post

		if err:=cursor.All(ctx,&posts);err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to parse posts"})
			return 
		}

		c.JSON(http.StatusOK,posts)

	}
}