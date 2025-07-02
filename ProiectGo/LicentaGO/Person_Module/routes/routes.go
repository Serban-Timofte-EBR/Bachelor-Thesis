package routes

import "github.com/labstack/echo/v4"

func RegisterRoutes(server *echo.Echo) {

	// Person routes
	server.POST("/create", createPerson)
	server.GET("/:id", getPerson)
	server.PUT("/:id", updatePerson)
	server.DELETE("/:id", deletePerson)
	server.GET("/all", getAllPersons)
}
