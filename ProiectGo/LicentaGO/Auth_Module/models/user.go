package models

import (
	"database/sql"
	"errors"
	"fmt"

	"eoncohub.com/auth_module/db"
)

type User struct {
	IDUser   int    `json:"id_user"`
	Username string `json:"username"`
	Password string `json:"password"`
	IDPerson int    `json:"id_person"`
}

type UserRole struct {
	User         User   `json:"user"`
	Status       string `json:"status"`
	CreationDate string `json:"creation_date"`
}

func GetUserByEmail(email string) (User, error) {
	var user User

	query := `
	SELECT u.USERNAME, u.PASSWORD, ur.ID_USER_ROLE, u.ID_PERSON 
	FROM XXAuth.USERS u 
	JOIN XXAuth.USER_ROLES ur ON u.ID_USER = ur.ID_USER 
	WHERE u.USERNAME = @username AND ur.STATUS = 'ACTIVE'`

	err := db.DB.QueryRow(query, sql.Named("username", email)).Scan(&user.Username, &user.Password, &user.IDUser, &user.IDPerson)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, fmt.Errorf("user not found")
		}
		return User{}, fmt.Errorf("database error: %v", err)
	}

	return user, nil
}
