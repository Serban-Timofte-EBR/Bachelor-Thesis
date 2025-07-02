package routes

import (
	"eoncohub.com/patient_module/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(server *echo.Echo) {

	protected := server.Group("/api")
	protected.Use(middleware.JWTMiddleware)
	protected.POST("/patient/create", createPatient)
	protected.GET("/patient/:id", getPatientByID)
	protected.GET("/patients", getAllPatients)
	protected.DELETE("/patient/delete/:id", deletePatient)
	protected.PUT("/patient/update/:id", updatePatient)
}
