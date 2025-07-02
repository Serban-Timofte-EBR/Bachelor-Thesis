package models

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"eoncohub.com/patient_module/utils"

	"eoncohub.com/patient_module/db"
	"github.com/labstack/gommon/log"
)

type Person struct {
	IDPerson       int64          `json:"id_person"`
	FName          string         `json:"f_name"`
	LName          string         `json:"l_name"`
	CNP            string         `json:"cnp"`
	BornDate       string         `json:"born_date"`
	Sex            string         `json:"sex"`
	Address        Address        `json:"address"`
	VirtualAddress VirtualAddress `json:"virtual_address"`
}

type VirtualAddress struct {
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
}

type CreatePersonResponse struct {
	IDPerson int `json:"id_person"`
}

type Patient struct {
	IDPatient int64  `json:"id_patient"`
	Person    Person `json:"person"`
}
type PatientResponse struct {
	Patient Patient `json:"patient"`
}

func rollbackPerson(idPerson int) {
	client := &http.Client{
		Timeout: 3 * time.Second,
	}

	url := fmt.Sprintf("http://person_module:8080/%d", idPerson)
	req, err := http.NewRequest(http.MethodDelete, url, nil)
	if err != nil {
		log.Warnf("RollbackPerson: failed to build request for ID %d: %v", idPerson, err)
		return
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Warnf("RollbackPerson: failed to call person_module for ID %d: %v", idPerson, err)
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		log.Warnf("RollbackPerson: person_module returned status %d for ID %d, response: %s",
			resp.StatusCode, idPerson, string(bodyBytes))
	} else {
		log.Infof("RollbackPerson: successfully rolled back person with ID %d", idPerson)
	}
}

func (patient *Patient) CreatePatient(doctorID int64) error {
	requestBody, err := json.Marshal(patient.Person)
	if err != nil {
		return fmt.Errorf("marshal person request: %w", err)
	}

	resp, err := http.Post("http://person_module:8080/create", "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		return fmt.Errorf("call create person endpoint: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("create person failed, status: %d, response: %s", resp.StatusCode, string(bodyBytes))
	}

	var personResp CreatePersonResponse
	if err := json.NewDecoder(resp.Body).Decode(&personResp); err != nil {
		return fmt.Errorf("decode create person response: %w", err)
	}

	tx, err := db.DB.Begin()
	if err != nil {
		rollbackPerson(personResp.IDPerson)
		return fmt.Errorf("start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
			rollbackPerson(personResp.IDPerson)
		} else {
			_ = tx.Commit()
		}
	}()

	var idPatient int64
	err = tx.QueryRow(`
		INSERT INTO XXPerson.PATIENTS (ID_PERSON)
		OUTPUT INSERTED.ID_PATIENT
		VALUES (@p1)
	`, sql.Named("p1", personResp.IDPerson)).Scan(&idPatient)
	if err != nil {
		return fmt.Errorf("insert patient: %w", err)
	}

	_, err = tx.Exec(`
		INSERT INTO XXPerson.PATIENTS_AND_DOCTORS (ID_PATIENT, ID_DOCTOR_HOSPITAL, STATUS)
		VALUES (@p1, @p2, 'ACTIVE')
	`, sql.Named("p1", idPatient), sql.Named("p2", doctorID))
	if err != nil {
		return fmt.Errorf("insert patients_and_doctors: %w", err)
	}

	patient.IDPatient = idPatient
	patient.Person.IDPerson = int64(personResp.IDPerson)

	log.Infof("Patient created: ID_PATIENT=%d, ID_PERSON=%d", idPatient, patient.Person.IDPerson)
	return nil
}

func (patient *Patient) GetPatientByID(idDoctor, idPatient int64) (PatientResponse, error) {
	var response PatientResponse

	query := `
        SELECT 
            P.ID_PATIENT,
            PE.ID_PERSON,
            PE.F_NAME,
            PE.L_NAME,
            PE.CNP,
            PE.BORN_DATE,
            PE.SEX,
            VA.EMAIL,
            VA.PHONE_NUMBER,
            AD.ADDRESS,
            LOC.NAME AS LOC_NAME,
            JUD.NAME AS JUD_NAME
        FROM 
            XXPerson.PATIENTS P
        JOIN 
            XXPerson.PERSONS PE ON P.ID_PERSON = PE.ID_PERSON
        JOIN 
            XXPerson.VIRTUAL_ADDRESS VA ON PE.ID_VIRTUAL_ADDRESS = VA.ID_VIRTUAL_ADDRESS
        JOIN 
            XXPerson.ADDRESS AD ON PE.ID_ADDRESS = AD.ID_ADDRESS
        JOIN 
            XXPerson.LOC LOC ON AD.ID_LOC = LOC.ID_LOC
        JOIN 
            XXPerson.JUD JUD ON LOC.ID_JUD = JUD.ID_JUD
        JOIN 
            XXPerson.PATIENTS_AND_DOCTORS PD ON P.ID_PATIENT = PD.ID_PATIENT
        WHERE 
            P.ID_PATIENT = @p1 AND PD.ID_DOCTOR_HOSPITAL = @p2
    `

	err := db.DB.QueryRow(query, sql.Named("p1", idPatient), sql.Named("p2", idDoctor)).Scan(
		&response.Patient.IDPatient,
		&response.Patient.Person.IDPerson,
		&response.Patient.Person.FName,
		&response.Patient.Person.LName,
		&response.Patient.Person.CNP,
		&response.Patient.Person.BornDate,
		&response.Patient.Person.Sex,
		&response.Patient.Person.VirtualAddress.Email,
		&response.Patient.Person.VirtualAddress.PhoneNumber,
		&response.Patient.Person.Address.Address,
		&response.Patient.Person.Address.Locality.Name,
		&response.Patient.Person.Address.Locality.Jud.Name,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return PatientResponse{}, fmt.Errorf("no patient found with ID %d for doctor ID %d", idPatient, idDoctor)
		}
		return PatientResponse{}, fmt.Errorf("failed to retrieve patient: %w", err)
	}

	return response, nil
}

func GetAllPatientsByDoctorID(idDoctor int64) ([]PatientResponse, error) {
	var patients []PatientResponse

	query := `
        SELECT 
            P.ID_PATIENT,
            PE.ID_PERSON,
            PE.F_NAME,
            PE.L_NAME,
            PE.CNP,
            PE.BORN_DATE,
            PE.SEX,
            VA.EMAIL,
            VA.PHONE_NUMBER,
            AD.ADDRESS,
            LOC.NAME AS LOC_NAME,
            JUD.NAME AS JUD_NAME
        FROM 
            XXPerson.PATIENTS P
        JOIN 
            XXPerson.PERSONS PE ON P.ID_PERSON = PE.ID_PERSON
        JOIN 
            XXPerson.VIRTUAL_ADDRESS VA ON PE.ID_VIRTUAL_ADDRESS = VA.ID_VIRTUAL_ADDRESS
        JOIN 
            XXPerson.ADDRESS AD ON PE.ID_ADDRESS = AD.ID_ADDRESS
        JOIN 
            XXPerson.LOC LOC ON AD.ID_LOC = LOC.ID_LOC
        JOIN 
            XXPerson.JUD JUD ON LOC.ID_JUD = JUD.ID_JUD
        JOIN 
            XXPerson.PATIENTS_AND_DOCTORS PD ON P.ID_PATIENT = PD.ID_PATIENT
        WHERE 
            PD.ID_DOCTOR_HOSPITAL = @p1
        AND 
            P.ISDELETED = 0
    `

	rows, err := db.DB.Query(query, sql.Named("p1", idDoctor))
	if err != nil {
		return nil, fmt.Errorf("failed to query patients: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var patient PatientResponse
		err := rows.Scan(
			&patient.Patient.IDPatient,
			&patient.Patient.Person.IDPerson,
			&patient.Patient.Person.FName,
			&patient.Patient.Person.LName,
			&patient.Patient.Person.CNP,
			&patient.Patient.Person.BornDate,
			&patient.Patient.Person.Sex,
			&patient.Patient.Person.VirtualAddress.Email,
			&patient.Patient.Person.VirtualAddress.PhoneNumber,
			&patient.Patient.Person.Address.Address,
			&patient.Patient.Person.Address.Locality.Name,
			&patient.Patient.Person.Address.Locality.Jud.Name,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan patient row: %w", err)
		}
		patients = append(patients, patient)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating patient rows: %w", err)
	}

	if len(patients) == 0 {
		return nil, fmt.Errorf("no patients found for doctor ID %d", idDoctor)
	}

	return patients, nil
}

func SoftDeletePatient(idPatient int64) error {
	tx, err := db.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		} else {
			_ = tx.Commit()
		}
	}()

	query := `
		UPDATE XXPerson.PATIENTS 
        SET ISDELETED = 1 
        WHERE ID_PATIENT = @p1
	`

	result, err := tx.Exec(query, sql.Named("p1", idPatient))
	if err != nil {
		return fmt.Errorf("failed to soft delete patient: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no patient found with ID %d", idPatient)
	}

	log.Printf("Successfully soft deleted patient with ID: %d", idPatient)
	return nil
}

func (patient *Patient) UpdatePatient(idPatient int64) error {
	start := time.Now()
	tx, err := db.DB.Begin()
	if err != nil {
		return fmt.Errorf("error beginning transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		} else {
			err = tx.Commit()
		}
	}()

	// Debugging log
	fmt.Printf("Attempting to update patient with ID: %d\n", idPatient)

	// Fetch the current patient and person info using idPatient
	err = tx.QueryRow(`
        SELECT p.id_patient, pe.id_person
        FROM XXPerson.patients p
        JOIN XXPerson.persons pe ON p.id_person = pe.id_person
        WHERE p.id_patient = @p1`,
		sql.Named("p1", idPatient)).
		Scan(&patient.IDPatient, &patient.Person.IDPerson)

	// Debugging logs for the query execution
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Printf("No patient found with ID %d\n", idPatient)
			return fmt.Errorf("no patient found with ID %d", idPatient)
		}
		return fmt.Errorf("error retrieving patient and person info: %w", err)
	}

	// Log the retrieved values for debugging
	fmt.Printf("Retrieved Patient ID: %d, Person ID: %d\n", patient.IDPatient, patient.Person.IDPerson)

	// Additional logic for updating the person or patient as needed
	if !utils.IsEmptyStruct(patient.Person) {
		requestBody, err := json.Marshal(patient.Person)
		if err != nil {
			return fmt.Errorf("failed to marshal person update request: %w", err)
		}

		url := fmt.Sprintf("http://person_module:8080/%d", patient.Person.IDPerson)
		req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(requestBody))
		if err != nil {
			return fmt.Errorf("failed to create HTTP request: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")

		start = time.Now()
		client := &http.Client{Timeout: 3 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to call update person endpoint: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			bodyBytes, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("failed to update person, status code: %d, response: %s", resp.StatusCode, string(bodyBytes))
		}
		fmt.Printf("Time taken for HTTP Request: %s\n", time.Since(start))
	}

	return nil
}
