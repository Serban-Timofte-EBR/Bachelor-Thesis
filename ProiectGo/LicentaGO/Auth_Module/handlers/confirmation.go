package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"eoncohub.com/auth_module/db"
	"github.com/labstack/echo/v4"
)

func ConfirmEmail(c echo.Context) error {
	confirmationToken := c.QueryParam("token")
	if confirmationToken == "" {
		log.Println("Confirmation token is missing")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing confirmation token"})
	}
	log.Printf("Received confirmation token: %s", confirmationToken)

	tx, err := db.DB.Begin()
	if err != nil {
		log.Printf("Failed to begin transaction: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}
	defer tx.Rollback()

	updateUserQuery := `
        UPDATE XXAuth.USERS
        SET EMAIL_CONFIRMED = 1
        WHERE CONFIRMATION_TOKEN = @token
    `
	result, err := tx.Exec(updateUserQuery, sql.Named("token", confirmationToken))
	if err != nil {
		log.Printf("Failed to update EMAIL_CONFIRMED: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to confirm email"})
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Failed to retrieve rows affected: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to confirm email"})
	}
	if rowsAffected == 0 {
		log.Println("No rows affected, invalid confirmation token")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid confirmation token"})
	}

	updateRoleQuery := `
        UPDATE XXAuth.USER_ROLES
        SET STATUS = 'ACTIVE'
        WHERE ID_USER = (
            SELECT ID_USER FROM XXAuth.USERS WHERE CONFIRMATION_TOKEN = @token
        )
    `
	_, err = tx.Exec(updateRoleQuery, sql.Named("token", confirmationToken))
	if err != nil {
		log.Printf("Failed to update USER_ROLES: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to activate user role"})
	}

	if err := tx.Commit(); err != nil {
		log.Printf("Failed to commit transaction: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to commit transaction"})
	}
	log.Println("Transaction committed successfully")

	log.Printf("Email confirmed successfully for token: %s", confirmationToken)

	return c.JSON(http.StatusOK, map[string]string{"message": "Email confirmed successfully"})
}
