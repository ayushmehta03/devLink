package controllers

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"time"
	"github.com/ayushmehta03/devLink-backend/utils"

	"github.com/ayushmehta03/devLink-backend/database"
	"github.com/ayushmehta03/devLink-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)



func GenerateOTP() string {
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "000000"
	}
	return fmt.Sprintf("%06d", n.Int64())
}




func HashPassword(password string) (string,error){
	bytes,err:=bcrypt.GenerateFromPassword([]byte(password),bcrypt.DefaultCost)
	if err!=nil{
		return "",err
	}

	return string(bytes),nil;
}





func RegisterUser(client *mongo.Client) gin.HandlerFunc{
	return func(c* gin.Context){

		var user models.User

		if err:=c.ShouldBindJSON(&user);err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid input data"})
			return

		}

		validate:=validator.New();

		if err:=validate.Struct(user);err!=nil{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Validation failed","details":err.Error()})
		return
		}

		hashedPassword,err:=HashPassword(user.Password)

		if err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":"Internal server error"})
			return 
		}


		var ctx,cancel=context.WithTimeout(context.Background(),100*time.Second)

		defer cancel();

		var userCollection *mongo.Collection=database.OpenCollection("users",client)

		count,err:=userCollection.CountDocuments(ctx,bson.M{"email":user.Email})

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to check existing user"})
			return
		}

		if count>0{
			c.JSON(http.StatusConflict,gin.H{"error":"User already exists"})
			return
		}


		otp:=GenerateOTP()
		otpHash,_:=HashPassword(otp)


		

		user.UserId=bson.NewObjectID().Hex()
		user.CreatedAt=time.Now()
		user.UpdatedAt=time.Now()
		user.Password=hashedPassword
		user.IsVerified=false
		user.Role="user"
		user.OTPHash=otpHash
		user.OTPExpiry = time.Now().Add(10 * time.Minute)



		_,err=userCollection.InsertOne(ctx,user)

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to register error"})
			return
		}


		err=utils.SendOTPEmail(user.Email,otp)

		if err!=nil{
			fmt.Println("Failed to send OTP email:",err)
		}


		c.JSON(http.StatusCreated,gin.H{"message":"User registered. Please verify OTP sent to email"});






	}
}

func VerifyOtp(client *mongo.Client) gin.HandlerFunc{
	return func(c*gin.Context){


		var req struct{
			Email string `json:"email" validate:"required,email"`
			OTP string `json:"otp" validate:"required"`

		}


		if err:=c.ShouldBindJSON(&req);err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"message":"Invalid input "})
			return
		}

		ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)


		defer cancel();


		userCollection:=database.OpenCollection("users",client)

		var user models.User

		err:=userCollection.FindOne(ctx,bson.M{"email":req.Email}).Decode(&user)
		

		if err!=nil{
			c.JSON(http.StatusNotFound,gin.H{"error":"No user found"})

		}

		if time.Now().After(user.OTPExpiry){
			c.JSON(http.StatusBadRequest,gin.H{"error":"OTP expired"})
			return
		}


		err=bcrypt.CompareHashAndPassword(
			[]byte(user.OTPHash),
			[]byte(req.OTP),
		)


		if err!=nil{
			c.JSON(http.StatusUnauthorized,gin.H{"error":"Invalid otp"})
			return 
		}


		update := bson.M{
			"$set": bson.M{
				"is_verified": true,
				"updated_at":  time.Now(),
			},
			"$unset": bson.M{
				"otp_hash":   "",
				"otp_expiry": "",
			},
		}

		_,err=userCollection.UpdateOne(ctx,bson.M{"email":req.Email},update)

		if err!=nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Verification failed"})
			return 
		}

		c.JSON(http.StatusOK,gin.H{"message":"Account verified successfully"})
		


	}
}








