package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
)

func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get the cookie
		cookie, err := c.Cookie("token")
		if err != nil {
			if errors.Is(err, http.ErrNoCookie) {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "No token provided"})
			}
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid token"})
		}

		// Get the JWT string from the cookie
		tokenString := cookie.Value

		// Parse the JWT string and store the result in `claims`
		claims := &jwt.StandardClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil {
			if errors.Is(err, jwt.ErrSignatureInvalid) {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token signature"})
			}
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid token"})
		}

		if !token.Valid {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
		}

		// If everything is good, save the claims in the context
		fmt.Println("User: ", claims.Issuer)
		c.Set("user", claims.Issuer)

		// Proceed to the next middleware/handler
		return next(c)
	}
}
