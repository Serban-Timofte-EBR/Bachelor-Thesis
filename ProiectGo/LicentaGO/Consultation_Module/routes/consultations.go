package routes

import (
	"encoding/json"
	"eoncohub.com/consulation_module/models"
	"eoncohub.com/consulation_module/utils"
	"fmt"
	"github.com/labstack/echo/v4"
	"log"
	"net/http"
	"strconv"
)

const maxUploadSize = 10 << 20 // 10 MB

func getConsultation(c echo.Context) error {
	idDoctorString := c.Get("user").(string)

	// get idPatient from url
	idPatientString := c.Param("id")
	idPatient, err := strconv.ParseInt(idPatientString, 10, 64)

	idDoctor, err := strconv.ParseInt(idDoctorString, 10, 64)
	consultation, err := models.GetLastConsultation(idDoctor, idPatient)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": err.Error(),
		})
	}
	return c.JSON(http.StatusOK, consultation)
}

func getAllConsultations(c echo.Context) error {
	idDoctorString := c.Get("user").(string)

	idPatientString := c.Param("id")
	idPatient, err := strconv.ParseInt(idPatientString, 10, 64)

	idDoctor, err := strconv.ParseInt(idDoctorString, 10, 64)
	consultations, err := models.GetAllConsultations(idDoctor, idPatient)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, consultations)
}

func createConsultation(c echo.Context) error {
	var consultationRequest models.ConsultationRequest

	jsonData := c.FormValue("json")
	if jsonData == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing JSON data",
		})
	}
	log.Println(jsonData)
	if err := json.Unmarshal([]byte(jsonData), &consultationRequest); err != nil {
		log.Printf("Error unmarshaling JSON: %v", err)
		log.Printf("Received JSON: %s", jsonData)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid JSON data",
		})
	}

	// Upload protocol file
	file, err := c.FormFile("protocol")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing protocol file",
		})
	}
	if file.Size > maxUploadSize {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("Protocol file is too big (max %d bytes)", maxUploadSize),
		})
	}
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error opening protocol file",
		})
	}
	defer src.Close()
	URL, err := utils.UploadFileToBlobStorage("consultations-container", file.Filename, src)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error uploading protocol file",
		})
	}
	consultationRequest.ProtocolUrl = URL

	// Upload report file
	report, err := c.FormFile("report")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing report file",
		})
	}
	if report.Size > maxUploadSize {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("Report file is too big (max %d bytes)", maxUploadSize),
		})
	}
	src, err = report.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error opening report file",
		})
	}
	defer src.Close()
	URL, err = utils.UploadFileToBlobStorage("consultations-container", report.Filename, src)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error uploading report file",
		})
	}
	consultationRequest.ReportUrl = URL

	// Upload rmn file
	rmn, err := c.FormFile("rmn")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing rmn file",
		})
	}
	if rmn.Size > maxUploadSize {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("RMN file is too big (max %d bytes)", maxUploadSize),
		})
	}
	src, err = rmn.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error opening RMN file",
		})
	}
	defer src.Close()
	URL, err = utils.UploadFileToBlobStorage("consultations-container", rmn.Filename, src)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error uploading RMN file",
		})
	}
	consultationRequest.RmnUrl = URL

	// Upload blood file
	blood, err := c.FormFile("blood")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing blood file",
		})
	}
	if blood.Size > maxUploadSize {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("Blood file is too big (max %d bytes)", maxUploadSize),
		})
	}
	src, err = blood.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error opening blood file",
		})
	}
	defer src.Close()
	URL, err = utils.UploadFileToBlobStorage("consultations-container", blood.Filename, src)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error uploading blood file",
		})
	}
	consultationRequest.BloodUrl = URL

	idDoctorString := c.Get("user").(string)

	idDoctor, err := strconv.ParseInt(idDoctorString, 10, 64)
	idAppointment, err := consultationRequest.CreateConsultation(idDoctor)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "Consultation created successfully",
		"Id_Appointment": idAppointment,
	})
}
