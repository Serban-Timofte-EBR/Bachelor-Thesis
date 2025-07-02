package models

import (
	"database/sql"
	"errors"
	"fmt"

	"eoncohub.com/auth_module/db"
	"eoncohub.com/auth_module/utils"
)

type LoginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthErrorType string

const (
	AuthErrorInvalidCredentials AuthErrorType = "InvalidCredentials"
	AuthErrorInactiveAccount    AuthErrorType = "InactiveAccount"
	AuthErrorInternal           AuthErrorType = "InternalError"
)

type AuthError struct {
	Type    AuthErrorType
	Details string
}

func (e *AuthError) Error() string {
	return fmt.Sprintf("%s: %s", e.Type, e.Details)
}

type UserCredential struct {
	Username   string
	HashedPass string
	UserRoleID int64
	PersonID   int64
}

func (l *LoginReq) Validate() (int64, error) {
	cred, err := findUserCredential(l.Email)
	if err != nil {
		return 0, err
	}

	if !utils.CheckPasswordHash(l.Password, cred.HashedPass) {
		return 0, &AuthError{Type: AuthErrorInvalidCredentials, Details: "Password mismatch"}
	}

	return cred.PersonID, nil
}

func findUserCredential(email string) (*UserCredential, error) {
	query := `
		SELECT u.USERNAME, u.PASSWORD, ur.ID_USER_ROLE, u.ID_PERSON 
		FROM XXAuth.USERS u 
		JOIN XXAuth.USER_ROLES ur ON u.ID_USER = ur.ID_USER 
		WHERE u.USERNAME = @username AND ur.STATUS = 'ACTIVE'
	`

	var cred UserCredential

	err := db.DB.QueryRow(query, sql.Named("username", email)).Scan(
		&cred.Username,
		&cred.HashedPass,
		&cred.UserRoleID,
		&cred.PersonID,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, &AuthError{Type: AuthErrorInvalidCredentials, Details: "No matching user"}
		}
		return nil, &AuthError{Type: AuthErrorInternal, Details: fmt.Sprintf("Query error: %v", err)}
	}

	return &cred, nil
}
