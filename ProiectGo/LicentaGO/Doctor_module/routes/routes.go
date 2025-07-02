package routes

import (
	"eoncohub.com/doctor_module/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(server *echo.Echo) {
	// These routes will be accessible without the /api prefix
	server.POST("/create", createDoctor)

	// This route will be accessible with the /api prefix
	protected := server.Group("/api")
	protected.Use(middleware.JWTMiddleware)
	protected.GET("/doctor", getDoctorV2Handler)
	protected.PUT("/doctor/update", updateDoctor)
	protected.DELETE("/doctor/delete", softDeleteDoctor)
}
