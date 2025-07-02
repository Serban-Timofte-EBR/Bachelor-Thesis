package models

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"reflect"
	"time"

	"github.com/labstack/gommon/log"

	"eoncohub.com/doctor_module/db"
	"eoncohub.com/doctor_module/utils"
)

type Person struct {
	IDPerson       int64          `json:"id_person"`
	FName          string         `json:"f_name"`
	LName          string         `json:"l_name"`
	CNP            string         `json:"cnp"`
	Sex            string         `json:"sex"`
	BornDate       time.Time      `json:"born_date"`
	Address        Address        `json:"address"`
	VirtualAddress VirtualAddress `json:"virtual_address"`
}

type VirtualAddress struct {
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
}

type DoctorResponse struct {
	IDDoctor int    `json:"id_doctor"`
	Parafa   string `json:"parafa"`
	Person   Person `json:"person"`
}

type CreatePersonResponse struct {
	IDPerson int `json:"id_person"`
}

type DeletePersonResponse struct {
	Message string `json:"message"`
}

type Doctor struct {
	IDDoctor int    `json:"id_doctor"`
	Person   Person `json:"person"`
	Parafa   string `json:"parafa"`
	Hospital string `json:"hospital"`
}

func removeEmptyFields(input interface{}) (map[string]interface{}, error) {
	inputValue := reflect.ValueOf(input)
	inputType := inputValue.Type()

	if inputType.Kind() != reflect.Struct {
		return nil, errors.New("input must be a struct")
	}

	output := make(map[string]interface{})
	for i := 0; i < inputValue.NumField(); i++ {
		field := inputValue.Field(i)
		fieldType := inputType.Field(i)

		// Check if the field is empty
		if !field.IsZero() {
			// Add non-empty field to output
			output[fieldType.Name] = field.Interface()
		}
	}

	return output, nil
}

// !!! Azure specific code!!!

func (doctor *Doctor) CreateDoctor() (int, error) {
	// Marshal the person data into JSON
	requestBody, err := json.Marshal(doctor.Person)
	if err != nil {
		return 0, fmt.Errorf("failed to marshal person request: %w", err)
	}

	log.Printf("CreateDoctor Called - Request Body: %s", string(requestBody))

	// Call the create person endpoint
	resp, err := http.Post("http://person_module:8080/create", "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		return 0, fmt.Errorf("failed to call create person endpoint: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return 0, fmt.Errorf("failed to create person, status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var personResponse CreatePersonResponse
	if err := json.NewDecoder(resp.Body).Decode(&personResponse); err != nil {
		return 0, fmt.Errorf("failed to decode person response: %w", err)
	}

	// Begin transaction
	tx, err := db.DB.Begin()
	if err != nil {
		return 0, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback() // Rollback if not committed

	// Insert the doctor into the DOCTORS table and get the new ID using OUTPUT clause
	query := `
        INSERT INTO XXPerson.DOCTORS (ID_PERSON, PARAFA) 
        OUTPUT INSERTED.ID_DOCTOR 
        VALUES (@p1, @p2)
    `
	err = tx.QueryRow(query, sql.Named("p1", personResponse.IDPerson), sql.Named("p2", doctor.Parafa)).Scan(&doctor.IDDoctor)
	if err != nil {
		return 0, fmt.Errorf("failed to insert doctor: %w", err)
	}

	// Get the hospital ID from the name
	var hospitalID int
	err = tx.QueryRow("SELECT ID_HOSPITAL FROM XXPerson.HOSPITALS WHERE UPPER(NAME) = UPPER(@p1)", sql.Named("p1", doctor.Hospital)).Scan(&hospitalID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, fmt.Errorf("hospital not found: %s", doctor.Hospital)
		}
		return 0, fmt.Errorf("failed to retrieve hospital: %w", err)
	}

	fmt.Println("Hospital ID: ", hospitalID)

	// Insert the doctor into the DOCTORS_AND_HOSPITALS table
	var newID int
	err = tx.QueryRow(`
        INSERT INTO XXPerson.DOCTORS_AND_HOSPITALS (ID_DOCTOR, ID_HOSPITAL) 
        OUTPUT INSERTED.ID_DOCTOR_HOSPITAL 
        VALUES (@p1, @p2)
    `, sql.Named("p1", doctor.IDDoctor), sql.Named("p2", hospitalID)).Scan(&newID)
	if err != nil {
		return 0, fmt.Errorf("failed to insert doctor into doctors_and_hospitals: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return newID, nil
}

func (doctor *Doctor) GetDoctorByID(idDoctorHospital int64) (DoctorResponse, error) {
	var doctorResponse DoctorResponse

	// Updated query to use SQL Server parameter syntax
	query := `
		SELECT 
			D.ID_DOCTOR,
			D.PARAFA,
			P.ID_PERSON,
			P.F_NAME,
			P.L_NAME,
			P.CNP,
			P.BORN_DATE,
			VA.EMAIL,
			VA.PHONE_NUMBER,
			AD.ADDRESS,
			LOC.NAME AS LOC_NAME,
			JUD.NAME AS JUD_NAME
		FROM 
			XXPerson.DOCTORS_AND_HOSPITALS DH
		JOIN 
			XXPerson.DOCTORS D ON D.ID_DOCTOR = DH.ID_DOCTOR
		JOIN 
			XXPerson.PERSONS P ON D.ID_PERSON = P.ID_PERSON
		JOIN 
			XXPerson.VIRTUAL_ADDRESS VA ON P.ID_VIRTUAL_ADDRESS = VA.ID_VIRTUAL_ADDRESS
		JOIN 
			XXPerson.ADDRESS AD ON P.ID_ADDRESS = AD.ID_ADDRESS
		JOIN 
			XXPerson.LOC LOC ON AD.ID_LOC = LOC.ID_LOC
		JOIN 
			XXPerson.JUD JUD ON LOC.ID_JUD = JUD.ID_JUD
		WHERE 
			DH.ID_DOCTOR_HOSPITAL = @p1 AND D.ISDELETED = 0` // Updated parameter and ISDELETED check for SQL Server

	// Execute the query and scan the result into DoctorResponse struct
	err := db.DB.QueryRow(query, sql.Named("p1", idDoctorHospital)).Scan(
		&doctorResponse.IDDoctor,
		&doctorResponse.Parafa,
		&doctorResponse.Person.IDPerson,
		&doctorResponse.Person.FName,
		&doctorResponse.Person.LName,
		&doctorResponse.Person.CNP,
		&doctorResponse.Person.BornDate,
		&doctorResponse.Person.VirtualAddress.Email,
		&doctorResponse.Person.VirtualAddress.PhoneNumber,
		&doctorResponse.Person.Address.Address,
		&doctorResponse.Person.Address.Locality.Name,
		&doctorResponse.Person.Address.Locality.Jud.Name,
	)
	if err != nil {
		return DoctorResponse{}, fmt.Errorf("failed to retrieve doctor: %w", err)
	}

	return doctorResponse, nil
}

func (doctor *Doctor) UpdateDoctor(idDoctorHospital int64) error {
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

	var curentParafa string
	// Combine the two SELECT queries into one
	err = tx.QueryRow(`
        SELECT d.id_doctor, d.id_person, d.parafa 
        FROM XXPerson.doctors_and_hospitals dh
        JOIN XXPerson.doctors d ON dh.id_doctor = d.id_doctor
        WHERE dh.id_doctor_hospital = @idDoctorHospital`,
		sql.Named("idDoctorHospital", idDoctorHospital)).
		Scan(&doctor.IDDoctor, &doctor.Person.IDPerson, &curentParafa)
	if err != nil {
		return fmt.Errorf("error retrieving doctor and person info: %w", err)
	}
	fmt.Printf("Time taken for Combined Query: %s\n", time.Since(start))

	// Update Parafa if it has changed
	if doctor.Parafa != "" && doctor.Parafa != curentParafa {
		start = time.Now()
		_, err = tx.Exec("UPDATE XXPerson.doctors SET parafa = @parafa WHERE id_doctor = @idDoctor",
			sql.Named("parafa", doctor.Parafa), sql.Named("idDoctor", doctor.IDDoctor))
		if err != nil {
			return fmt.Errorf("error updating doctor parafa: %w", err)
		}
		fmt.Printf("Time taken for Update Query: %s\n", time.Since(start))
	}

	// Update Person if needed
	if !utils.IsEmptyStruct(doctor.Person) {
		requestBody, err := json.Marshal(doctor.Person)
		if err != nil {
			return fmt.Errorf("failed to marshal person update request: %w", err)
		}

		url := fmt.Sprintf("http://person_module:8080/%d", doctor.Person.IDPerson)
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
			bodyBytes, _ := ioutil.ReadAll(resp.Body)
			return fmt.Errorf("failed to update person, status code: %d, response: %s", resp.StatusCode, string(bodyBytes))
		}
		fmt.Printf("Time taken for HTTP Request: %s\n", time.Since(start))
	}

	return nil
}

func SoftDeleteDoctor(idDoctorHospital int64) error {
	// Begin a new transaction
	tx, err := db.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Retrieve the doctor ID associated with the given doctor hospital ID
	var idDoctor int64
	// Updated SQL Server parameter syntax
	err = db.DB.QueryRow("SELECT id_doctor FROM XXPerson.DOCTORS_AND_HOSPITALS WHERE id_doctor_hospital = @idDoctorHospital", sql.Named("idDoctorHospital", idDoctorHospital)).Scan(&idDoctor)
	if err != nil {
		return fmt.Errorf("error retrieving doctor ID: %w", err)
	}

	// Soft delete the doctor from the doctors table
	_, err = tx.Exec("UPDATE XXPerson.DOCTORS SET isDeleted = 1 WHERE id_doctor = @idDoctor", sql.Named("idDoctor", idDoctor))
	if err != nil {
		return fmt.Errorf("error soft deleting doctor: %w", err)
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}
