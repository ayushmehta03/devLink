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


func SendChatRequest(client *mongo.Client)gin.HandlerFunc{
	return func(c *gin.Context){


		userId,exits:=c.Get("user_id")

		if !exits{
			c.JSON(http.StatusUnauthorized,gin.H{"error":"Unauthorized"})
			return 
		}


		senderId,_:=bson.ObjectIDFromHex(userId.(string))

		var body struct{
			ReceiverID string `json:"receiver_id"`
		}

		if err:=c.ShouldBindJSON(&body);err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid input"})
			return 
		}


		receiverId,err:=bson.ObjectIDFromHex(body.ReceiverID)

		if err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid receiver id"})
			return 
		}
		if senderId==receiverId{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Cannot send message request to self"})
			return 
		}


		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)

		defer cancel()


		chatCollection:=database.OpenCollection("chat_requests",client)


		count,_:=chatCollection.CountDocuments(ctx,bson.M{
			"sender_id":senderId,
			"receiver_id":receiverId,
			"status":"pending",
		})

		if count>0{
			c.JSON(http.StatusConflict,gin.H{"error":"Chat request already sent"})
			return 
		}

		//create request here 

		request:=models.ChatRequest{
			ID: bson.NewObjectID(),
			SenderID: senderId,
			ReceiverID: receiverId,
			Status: "pending",
			CreatedAt: time.Now(),
		}	

		_,err=chatCollection.InsertOne(ctx,request)

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to send message request"})
			return 
		}

		c.JSON(http.StatusCreated,gin.H{"message":"Chat request sent "})

	}
}