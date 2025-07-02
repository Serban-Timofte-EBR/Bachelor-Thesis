package routes

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"time"
)

func logout(c echo.Context) error {
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = ""
	cookie.Expires = time.Now().Add(-1 * time.Hour) // Set expiration to the past
	cookie.HttpOnly = true
	cookie.Secure = false
	cookie.Path = "/"

	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}
