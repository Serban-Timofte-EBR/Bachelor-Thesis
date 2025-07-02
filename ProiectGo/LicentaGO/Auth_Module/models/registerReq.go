package models

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"eoncohub.com/auth_module/db"
	"eoncohub.com/auth_module/utils"

	"github.com/google/uuid"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

var ErrUserAlreadyExists = errors.New("user already exists")

type PersonReq struct {
	FName          string            `json:"f_name"`
	LName          string            `json:"l_name"`
	CNP            string            `json:"cnp"`
	Sex            string            `json:"sex"`
	BornDate       time.Time         `json:"born_date"`
	AddressReq     AddressReq        `json:"address"`
	VirtualAddress VirtualAddressReq `json:"virtual_address"`
}

type AddressReq struct {
	Address string `json:"address"`
	Loc     LocReq `json:"loc"`
}

type LocReq struct {
	Name string `json:"name"`
	Jud  JudReq `json:"jud"`
}

type JudReq struct {
	Name string `json:"name"`
}

type VirtualAddressReq struct {
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
}
type RegisterReq struct {
	PersonReq PersonReq `json:"person"`
	Parafa    string    `json:"parafa"`
	Hospital  string    `json:"hospital"`
	Password  string    `json:"password"`
}

type DoctorCreationResponse struct {
	ID      int    `json:"id"`
	Message string `json:"message"`
}

func (r *RegisterReq) Register() error {
	tx, err := db.DB.Begin()
	if err != nil {
		return fmt.Errorf("start transaction: %w", err)
	}
	defer tx.Rollback()

	officialEmail, err := r.getOfficialHospitalEmail(tx)
	if err != nil {
		return fmt.Errorf("get hospital email: %w", err)
	}

	token := uuid.New().String()
	confirmURL := fmt.Sprintf("https://localhost:3000/confirm?token=%s", token)

	if err := sendConfirmationEmail(officialEmail, confirmURL); err != nil {
		return fmt.Errorf("send confirmation email: %w", err)
	}

	personID, err := r.createDoctorProfile()
	if err != nil {
		return fmt.Errorf("create doctor profile: %w", err)
	}

	if err := r.insertUser(tx, int64(personID), token); err != nil {
		if errors.Is(err, ErrUserAlreadyExists) {
			return ErrUserAlreadyExists
		}
		return fmt.Errorf("insert user: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit transaction: %w", err)
	}

	return nil
}

func (r *RegisterReq) createDoctorProfile() (int, error) {
	doctorURL := "http://doctor_module:8081/create"

	payload, err := json.Marshal(map[string]interface{}{
		"person":   r.PersonReq,
		"parafa":   r.Parafa,
		"hospital": r.Hospital,
	})
	if err != nil {
		return 0, fmt.Errorf("marshal doctor request: %w", err)
	}

	resp, err := http.Post(doctorURL, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return 0, fmt.Errorf("call doctor module: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("doctor module returned status: %s", resp.Status)
	}

	var result DoctorCreationResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, fmt.Errorf("decode doctor response: %w", err)
	}

	return result.ID, nil
}

func (r *RegisterReq) getOfficialHospitalEmail(tx *sql.Tx) (string, error) {
	var email string
	err := tx.QueryRow(`
		SELECT VA.EMAIL
		FROM XXPerson.VIRTUAL_ADDRESS VA
		JOIN XXPerson.HOSPITALS H ON VA.ID_VIRTUAL_ADDRESS = H.ID_VIRTUAL_ADDRESS
		WHERE H.NAME = @hospitalName
	`,
		sql.Named("hospitalName", r.Hospital),
	).Scan(&email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", fmt.Errorf("hospital email not found")
		}
		return "", fmt.Errorf("query error: %w", err)
	}
	return email, nil
}

func (r *RegisterReq) insertUser(tx *sql.Tx, personID int64, token string) error {
	hashed, err := utils.HashPassword(r.Password)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	var idUser int64
	err = tx.QueryRow(`
		INSERT INTO XXAuth.USERS (USERNAME, PASSWORD, ID_PERSON, CONFIRMATION_TOKEN, EMAIL_CONFIRMED)
		OUTPUT INSERTED.ID_USER
		VALUES (@username, @password, @id_person, @token, @confirmed)
	`,
		sql.Named("username", r.PersonReq.VirtualAddress.Email),
		sql.Named("password", hashed),
		sql.Named("id_person", personID),
		sql.Named("token", token),
		sql.Named("confirmed", false),
	).Scan(&idUser)
	if err != nil {
		return fmt.Errorf("insert USERS: %w", err)
	}

	_, err = tx.Exec(`
		INSERT INTO XXAuth.USER_ROLES (ID_USER, ID_ROLE, STATUS)
		VALUES (@id_user, @id_role, 'INACTIVE')
	`,
		sql.Named("id_user", idUser),
		sql.Named("id_role", 1),
	)
	if err != nil {
		return fmt.Errorf("insert USER_ROLES: %w", err)
	}

	return nil
}

func sendConfirmationEmail(toEmail, confirmURL string) error {
	apiKey := os.Getenv("SENDGRID_API_KEY")
	if apiKey == "" {
		return errors.New("SendGrid API key is missing")
	}

	from := mail.NewEmail("Eoncohub", "no-reply@eoncohub.com")
	subject := "Confirm Your Account"
	to := mail.NewEmail("", toEmail)

	plain := fmt.Sprintf("Please confirm your account: %s", confirmURL)
	html := fmt.Sprintf(`<p>Please confirm your account by clicking below:</p><p><a href="%s">Confirm Account</a></p>`, confirmURL)

	message := mail.NewSingleEmail(from, subject, to, plain, html)
	client := sendgrid.NewSendClient(apiKey)
	resp, err := client.Send(message)
	if err != nil {
		return fmt.Errorf("send email: %w", err)
	}
	if resp.StatusCode >= 400 {
		return fmt.Errorf("sendgrid error: %s", resp.Body)
	}

	return nil
}
