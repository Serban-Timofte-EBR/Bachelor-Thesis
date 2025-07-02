package routes

import (
	"eoncohub.com/auth_module/models"
	"github.com/labstack/echo/v4"
)

func signup(context echo.Context) error {
	var req models.SignupReq
	if err := context.Bind(&req); err != nil {
		return context.JSON(400, map[string]string{"message": "Invalid request"})
	}

	if req.Role == 1 {
	}

	return context.JSON(200, map[string]string{"message": "Signup successful"})
}
