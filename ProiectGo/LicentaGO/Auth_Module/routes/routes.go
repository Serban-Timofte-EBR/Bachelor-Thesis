package routes

import (
	"eoncohub.com/auth_module/handlers"
	"eoncohub.com/auth_module/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(server *echo.Echo) {
	// Public routes
	server.POST("/login", login)
	server.POST("/signup", signup)
	server.POST("/logout", logout)
	server.POST("/register", registerUser)
	server.GET("/confirm", handlers.ConfirmEmail)
	server.POST("/request-password-reset", handlers.RequestPasswordReset)
	server.POST("/confirm-password-reset", handlers.ConfirmPasswordReset)

	// Protected routes
	protected := server.Group("/api")
	protected.Use(middleware.JWTMiddleware)
	protected.GET("/check", checkAuth)
	protected.POST("/logout", logout)

}
