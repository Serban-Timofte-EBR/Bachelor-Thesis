package routes

import (
	"eoncohub.com/consulation_module/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(server *echo.Echo) {
	protected := server.Group("/api")
	protected.Use(middleware.JWTMiddleware)
	protected.POST("/create", createConsultation)
	protected.GET("/:id/get-last", getConsultation)
	protected.GET("/:id/get-all", getAllConsultations)
}
