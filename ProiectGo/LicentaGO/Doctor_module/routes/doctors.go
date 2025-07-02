package routes

import (
	"fmt"
	"net/http"
	"strconv"

	"eoncohub.com/doctor_module/models"
	"github.com/labstack/echo/v4"
)

func createDoctor(context echo.Context) error {
	var doctor models.Doctor

	if err := context.Bind(&doctor); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	idDoctor, err := doctor.CreateDoctor()

	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusOK, map[string]any{"message": "Doctor created successfully", "id": idDoctor})
}

func getDoctorV2Handler(context echo.Context) error {
	idStr := context.Get("user").(string)
	fmt.Println("User inside request: ", idStr)
	idDoctorHospital, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid doctor hospital ID"})
	}

	var doctor models.Doctor
	doctorResponse, err := doctor.GetDoctorByID(idDoctorHospital)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return context.JSON(http.StatusOK, doctorResponse)
}

func updateDoctor(context echo.Context) error {
	var doctor models.Doctor

	if err := context.Bind(&doctor); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	fmt.Printf("Ce am primit: %+v\n", doctor)

	idDoctorHospitalStr := context.Get("user").(string)
	idDoctorHospital, err := strconv.ParseInt(idDoctorHospitalStr, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid doctor hospital ID"})
	}

	err = doctor.UpdateDoctor(idDoctorHospital)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return context.JSON(http.StatusOK, map[string]string{"message": "Doctor updated successfully"})
}

func softDeleteDoctor(context echo.Context) error {
	// Parse the doctor hospital ID from the URL
	idDoctorHospitalStr := context.Get("id").(string)
	idDoctorHospital, err := strconv.ParseInt(idDoctorHospitalStr, 10, 64)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid doctor hospital ID"})
	}

	// Call the SoftDeleteDoctor function to softly delete the doctor
	err = models.SoftDeleteDoctor(idDoctorHospital)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})

	}

	return context.JSON(http.StatusOK, map[string]string{"message": "Doctor soft deleted successfully"})
}
