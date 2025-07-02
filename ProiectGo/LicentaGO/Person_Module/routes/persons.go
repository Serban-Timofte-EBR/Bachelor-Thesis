package routes

import (
	"eoncohub.com/person_module/models"
	"errors"
	"fmt"
	"github.com/labstack/echo/v4"
	"log"
	"net/http"
	"strconv"
	"time"
)

func createPerson(context echo.Context) error {
	log.Printf("Creating person")
	var person models.Person
	err := context.Bind(&person)
	if err != nil {
		return context.JSON(400, map[string]string{"error": "Invalid request"})
	}

	fmt.Println("Person received from request:", person)

	err = person.Create()
	if err != nil {
		return context.JSON(500, map[string]string{"error": err.Error()})
	}
	return context.JSON(200, map[string]any{"id_person": person.IDPerson})
}

func getPerson(context echo.Context) error {
	id := context.Param("id")
	intId, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return context.JSON(400, map[string]string{"error": "Invalid id"})
	}
	person, err := models.GetPerson(intId)
	if err != nil {
		return context.JSON(500, map[string]string{"error": err.Error()})
	}
	return context.JSON(200, person)
}

func getAllPersons(context echo.Context) error {
	var persons []models.Person

	persons, err := models.GetAllPersons()

	if err != nil {
		return context.JSON(500, map[string]any{"error": err.Error()})
	}

	return context.JSON(200, persons)
}

func updatePerson(context echo.Context) error {
	id := context.Param("id")
	fmt.Println("ID received from request IN PERSON:", id)
	personID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid person ID"})
	}

	// Create a map to hold the updated fields
	var updatedFields map[string]interface{}
	if err := context.Bind(&updatedFields); err != nil {
		log.Printf("Error binding request body: %v", err)
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Print the received fields for debugging
	fmt.Println("Received fields:", updatedFields)

	// Fetch the existing person
	existingPerson, err := models.GetPerson(personID)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": "Error fetching person"})
	}

	// Update only the fields that are present in the request
	if v, ok := updatedFields["f_name"].(string); ok {
		existingPerson.FName = v
	}
	if v, ok := updatedFields["l_name"].(string); ok {
		existingPerson.LName = v
	}
	if v, ok := updatedFields["cnp"].(string); ok {
		existingPerson.CNP = v
	}
	if v, ok := updatedFields["sex"].(string); ok {
		existingPerson.Sex = v
	}
	if v, ok := updatedFields["born_date"].(string); ok {
		bornDate, err := time.Parse(time.RFC3339, v)
		if err == nil {
			existingPerson.BornDate = bornDate
		}
	}

	// Handle nested structures
	if address, ok := updatedFields["address"].(map[string]interface{}); ok {
		if v, ok := address["address"].(string); ok {
			existingPerson.Address.Address = v
		}
		// Handle other address fields similarly
	}

	if virtualAddress, ok := updatedFields["virtual_address"].(map[string]interface{}); ok {
		if v, ok := virtualAddress["email"].(string); ok {
			existingPerson.VirtualAddress.Email = v
		}
		if v, ok := virtualAddress["phone_number"].(string); ok {
			existingPerson.VirtualAddress.PhoneNumber = v
		}
	}

	// Call the Update method on the person model
	err = existingPerson.Update()
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return context.JSON(http.StatusOK, map[string]string{"message": "Person updated successfully"})
}
func deletePerson(c echo.Context) error {
	// Parse the person ID from the URL
	id := c.Param("id")
	personID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid person ID"})
	}

	// Call the model function to delete the person
	err = models.DeletePerson(personID)
	if err != nil {
		if errors.Is(err, models.ErrPersonNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Person not found or already expired"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error deleting person: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Person deleted successfully"})
}
