package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"eoncohub.com/auth_module/db"
	"eoncohub.com/auth_module/models"
	"eoncohub.com/auth_module/utils"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type ForgotPasswordReq struct {
	Email string `json:"email"`
}

func RequestPasswordReset(c echo.Context) error {
	var req ForgotPasswordReq
	err := c.Bind(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}
	email := req.Email

	// check if user exists

	if email == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Email is required"})
	}

	_, err = models.GetUserByEmail(email)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "User does not exists"})
	}

	tx, err := db.DB.Begin()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}
	defer tx.Rollback()

	resetToken := uuid.New().String()
	resetLink := fmt.Sprintf("http://localhost:3000/reset-password?token=%s", resetToken)

	query := `
    UPDATE XXAuth.USERS
    SET RESET_TOKEN = @reset_token
    WHERE EMAIL = @user_email
    `
	_, err = tx.Exec(query, sql.Named("reset_token", resetToken), sql.Named("user_email", email))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to set reset token"})
	}

	if err := tx.Commit(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to commit transaction"})
	}

	err = sendResetEmail(email, resetLink)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to send reset email"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Password reset email sent"})
}

func sendResetEmail(toEmail string, resetLink string) error {
	sendGridAPIKey := os.Getenv("SENDGRID_API_KEY")
	if sendGridAPIKey == "" {
		return fmt.Errorf("SendGrid API key is not set")
	}

	from := mail.NewEmail("Eoncohub", "serban-timofte@outlook.com")
	subject := "Password Reset Request"
	to := mail.NewEmail("", toEmail)
	plainTextContent := fmt.Sprintf("Please reset your password by clicking the following link: %s", resetLink)
	htmlContent := fmt.Sprintf("<p>Please reset your password by clicking the following link:</p><a href=\"%s\">Reset Password</a>", resetLink)
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(sendGridAPIKey)
	response, err := client.Send(message)
	if err != nil {
		log.Printf("Failed to send email: %v", err)
		return err
	}
	if response.StatusCode >= 400 {
		log.Printf("Failed to send email. Status Code: %d, Body: %s", response.StatusCode, response.Body)
		return fmt.Errorf("failed to send email, status code: %d", response.StatusCode)
	}
	log.Printf("Password reset email sent to %s", toEmail)
	return nil
}

func ConfirmPasswordReset(c echo.Context) error {
	resetToken := c.QueryParam("token")
	newPassword := c.FormValue("new_password")
	if resetToken == "" || newPassword == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing token or new password"})
	}

	tx, err := db.DB.Begin()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error"})
	}
	defer tx.Rollback()

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to hash password"})
	}

	updateQuery := `
    UPDATE XXAuth.USERS
    SET PASSWORD = @new_password, RESET_TOKEN = NULL
    WHERE RESET_TOKEN = @token
    `
	result, err := tx.Exec(updateQuery, sql.Named("new_password", hashedPassword), sql.Named("token", resetToken))
	if err != nil {
		log.Printf("Failed to update password: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to reset password"})
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to reset password"})
	}
	if rowsAffected == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid reset token"})
	}

	if err := tx.Commit(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to commit transaction"})
	}

	log.Printf("Password reset successfully for token: %s", resetToken)
	return c.JSON(http.StatusOK, map[string]string{"message": "Password reset successfully"})
}
