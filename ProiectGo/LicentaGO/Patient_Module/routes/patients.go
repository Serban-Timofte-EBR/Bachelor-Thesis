package routes

import (
	"fmt"
	"net/http"
	"strconv"

	"eoncohub.com/patient_module/models"
	"github.com/labstack/echo/v4"
)

func createPatient(context echo.Context) error {
	var patient models.Patient

	// Bind request body to patient struct
	if err := context.Bind(&patient); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	doctorIDstr, ok := context.Get("user").(string) // "user" here refers to the "Issuer" field, which is the doctor ID.
	if !ok {
		return context.JSON(http.StatusUnauthorized, map[string]string{"error": "Doctor ID not found in token"})
	}

	doctorID, err := strconv.ParseInt(doctorIDstr, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid doctor ID"})
	}

	err = patient.CreatePatient(doctorID)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Return success message
	return context.JSON(http.StatusOK, map[string]string{"message": "Patient created successfully"})
}

func getPatientByID(context echo.Context) error {
	idParam := context.Param("id")
	idPatient, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid patient ID"})
	}
	doctorIDstr, ok := context.Get("user").(string) // "user" here refers to the "Issuer" field, which is the doctor ID.
	if !ok {
		return context.JSON(http.StatusUnauthorized, map[string]string{"error": "Doctor ID not found in token"})
	}

	doctorID, err := strconv.ParseInt(doctorIDstr, 10, 64)
	var patient models.Patient
	patientResponse, err := patient.GetPatientByID(doctorID, idPatient)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return context.JSON(http.StatusOK, patientResponse)
}

func getAllPatients(context echo.Context) error {
	doctorIDstr, ok := context.Get("user").(string) // "user" here refers to the "Issuer" field, which is the doctor ID.
	if !ok {
		return context.JSON(http.StatusUnauthorized, map[string]string{"error": "Doctor ID not found in token"})
	}

	doctorID, err := strconv.ParseInt(doctorIDstr, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid doctor ID"})
	}
	var patientList []models.PatientResponse
	patientList, err = models.GetAllPatientsByDoctorID(doctorID)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusOK, patientList)
}

func deletePatient(c echo.Context) error {
	idPatient, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid patient ID"})
	}

	err = models.SoftDeletePatient(idPatient)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Patient successfully deleted"})
}

func updatePatient(context echo.Context) error {
	var patient models.Patient

	if err := context.Bind(&patient); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	idParam := context.Param("id")
	idPatient, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid patient ID"})
	}

	fmt.Printf("Received patient ID: %d\n", idPatient) // Debugging log

	err = patient.UpdatePatient(idPatient)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return context.JSON(http.StatusOK, map[string]string{"message": "Patient updated successfully"})
}
