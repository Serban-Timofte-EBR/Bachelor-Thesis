package routes

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"net/http"
)

func checkAuth(c echo.Context) error {
	user := c.Get("user").(string)
	fmt.Println("User: ", user)
	return c.JSON(http.StatusOK, map[string]any{"isLoggedIn": true, "user": user})
}
