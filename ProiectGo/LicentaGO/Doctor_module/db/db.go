package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/microsoft/go-mssqldb"
)

var DB *sql.DB

func InitDB() error {
	username := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	server := os.Getenv("DB_SERVER")
	port := os.Getenv("DB_PORT")
	database := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("server=%s;user id=%s;password=%s;port=%s;database=%s;",
		server, username, password, port, database)

	var err error
	DB, err = sql.Open("sqlserver", connStr)
	if err != nil {
		return fmt.Errorf("error opening database: %w", err)
	}

	DB.SetMaxOpenConns(25)                 // Maximum number of open connections to the database
	DB.SetMaxIdleConns(5)                  // Maximum number of connections in the idle connection pool
	DB.SetConnMaxLifetime(5 * time.Minute) // Maximum amount of time a connection may be reused

	// Test the connection
	err = DB.Ping()
	if err != nil {
		return fmt.Errorf("error pinging database: %w", err)
	}

	// Execute a test query to check the connection
	var currentTime time.Time
	err = DB.QueryRow("SELECT SYSDATETIME()").Scan(&currentTime) // SQL Server equivalent of Oracle's SYSTIMESTAMP
	if err != nil {
		return fmt.Errorf("error executing query: %w", err)
	}

	log.Printf("Connected to the Azure SQL Database. Current system timestamp: %v\n", currentTime)
	return nil
}

func CloseDB() {
	if DB != nil {
		err := DB.Close()
		if err != nil {
			log.Printf("Error closing database: %v", err)
		} else {
			log.Printf("Database connection closed.")
		}
	}
}
