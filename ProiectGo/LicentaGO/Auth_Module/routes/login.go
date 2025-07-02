package routes

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"eoncohub.com/auth_module/models"
	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

func login(c echo.Context) error {
	var loginReq models.LoginReq

	err := c.Bind(&loginReq)
	if err != nil {
		fmt.Printf("Bind error: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	id, err := loginReq.Validate()
	if err != nil {
		log.Printf("Validation error: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
	}

	// Create the JWT claims, which includes the username and expiry time
	claims := &jwt.StandardClaims{
		ExpiresAt: time.Now().Add(time.Hour * 8).Unix(),
		Issuer:    strconv.FormatInt(id, 10),
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Could not generate token",
		})
	}

	fmt.Println("Token: ", t)

	// Set the JWT as an HTTP-only cookie
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = t
	cookie.Expires = time.Now().Add(8 * time.Hour)
	cookie.HttpOnly = true
	cookie.Secure = false
	cookie.SameSite = http.SameSiteLaxMode
	cookie.Path = "/"
	c.Response().Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	c.Response().Header().Set("Access-Control-Allow-Credentials", "true")
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Login successful",
	})
}
