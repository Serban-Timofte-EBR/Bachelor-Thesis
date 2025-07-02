package routes

import (
	"eoncohub.com/auth_module/models"
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
)

func registerUser(context echo.Context) error {
	log.Printf("Received registration request")
	var registerReq models.RegisterReq

	err := context.Bind(&registerReq)
	if err != nil {
		log.Printf("Error binding request body: %v", err)
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	err = registerReq.Register()
	if err != nil {
		if err == models.ErrUserAlreadyExists {
			return context.JSON(http.StatusConflict, map[string]string{"error": "User already exists"})
		}
		log.Printf("Registration error: %v", err)
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return context.JSON(http.StatusOK, map[string]string{
		"message": "User registered successfully",
	})
}
