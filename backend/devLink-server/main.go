package main

import (
	"context"
	"log"

	"github.com/ayushmehta03/devLink-backend/database"
)

func main() {
	client := database.Connect()
	if client == nil {
		log.Fatal("MongoDB client is nil")
	}

	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}()
}
