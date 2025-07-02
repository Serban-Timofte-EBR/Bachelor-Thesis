package middleware

import (
	"errors"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
)

// JWTMiddleware validates a JWT token from the "token" cookie
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie("token")
		if err != nil {
			if errors.Is(err, http.ErrNoCookie) {
				return unauthorized(c, "Missing auth token")
			}
			return badRequest(c, "Invalid cookie")
		}

		tokenString := cookie.Value

		claims := &jwt.StandardClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil {
			if errors.Is(err, jwt.ErrSignatureInvalid) {
				return unauthorized(c, "Invalid signature")
			}
			return badRequest(c, "Invalid token")
		}

		if !token.Valid {
			return unauthorized(c, "Invalid token")
		}

		c.Set("user_id", claims.Subject)

		return next(c)
	}
}

func unauthorized(c echo.Context, msg string) error {
	return c.JSON(http.StatusUnauthorized, map[string]interface{}{
		"error":      msg,
		"isLoggedIn": false,
	})
}

func badRequest(c echo.Context, msg string) error {
	return c.JSON(http.StatusBadRequest, map[string]interface{}{
		"error":      msg,
		"isLoggedIn": false,
	})
}
