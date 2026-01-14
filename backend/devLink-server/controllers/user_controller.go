package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/ayushmehta03/devLink-backend/database"
	"github.com/ayushmehta03/devLink-backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)


func GetUserProfile(client *mongo.Client )gin.HandlerFunc{
	return func(c* gin.Context){


		userId:=c.Param("id")

		userObjId,err:=bson.ObjectIDFromHex(userId)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()


		userCollection:=database.OpenCollection("users",client)
		postCollection:=database.OpenCollection("posts",client)

		var user models.User


		err=userCollection.FindOne(ctx,bson.M{"_id":userObjId}).Decode(&user)

		if err!=nil{
		c.JSON(http.StatusNotFound,gin.H{"error":"User not found"})
		return 
		}

		filter:=bson.M{
			"author_id":user.Id,
			"published":true,
		}

		cursor,_:=postCollection.Find(ctx,filter)

		 posts:=[]models.Post{}

		cursor.All(ctx,&posts)

c.JSON(http.StatusOK, gin.H{
			"user": gin.H{
				"name": user.UserName,
				"bio":  user.Bio,
			},
			"posts": posts,
		})	}
}