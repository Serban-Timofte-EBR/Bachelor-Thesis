package models

import (
	"database/sql"
	"fmt"
	"time"
)

type VirtualAddress struct {
	ID          int64     `json:"id_virtual_address"`
	Email       string    `json:"email"`
	PhoneNumber string    `json:"phone_number"`
	DateIn      time.Time `json:"date_in"`
	DateOut     time.Time `json:"date_out"`
}

// !!! Azure SQL specific code !!!

func (v *VirtualAddress) CreateVirtualAddress(tx *sql.Tx) error {
	// Initialize the DateIn value to the current time
	v.DateIn = time.Now()

	// Prepare the SQL Server INSERT statement
	stmt, err := tx.Prepare(`
        INSERT INTO XXPerson.VIRTUAL_ADDRESS (email, phone_number, date_in) 
        OUTPUT INSERTED.ID_VIRTUAL_ADDRESS 
        VALUES (@p1, @p2, @p3)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Execute the statement and capture the inserted ID
	err = stmt.QueryRow(v.Email, v.PhoneNumber, v.DateIn).Scan(&v.ID)
	if err != nil {
		return fmt.Errorf("error inserting VirtualAddress: %w", err)
	}

	return nil
}

func (v *VirtualAddress) UpdateVirtualAddress(tx *sql.Tx) error {
	// First, expire the old record by setting DATE_OUT to the current timestamp
	_, err := tx.Exec(`
        UPDATE XXPerson.VIRTUAL_ADDRESS 
        SET DATE_OUT = GETDATE() 
        WHERE ID_VIRTUAL_ADDRESS = @p1 AND DATE_OUT IS NULL
    `, sql.Named("p1", v.ID))
	if err != nil {
		return fmt.Errorf("error expiring old virtual address: %w", err)
	}

	// Now, create a new record using SQL Server's INSERT with OUTPUT clause to get the new ID
	query := `
        INSERT INTO XXPerson.VIRTUAL_ADDRESS (EMAIL, PHONE_NUMBER, DATE_IN) 
        OUTPUT INSERTED.ID_VIRTUAL_ADDRESS 
        VALUES (@p1, @p2, GETDATE())
    `

	// Prepare the statement for inserting a new virtual address
	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("error preparing statement for new virtual address: %w", err)
	}
	defer stmt.Close()

	var newID int64
	// Execute the statement and get the new ID using OUTPUT INSERTED
	err = stmt.QueryRow(sql.Named("p1", v.Email), sql.Named("p2", v.PhoneNumber)).Scan(&newID)
	if err != nil {
		return fmt.Errorf("error creating new virtual address: %w", err)
	}

	// Update the ID in the struct to reflect the new record
	v.ID = newID
	v.DateIn = time.Now()   // Set DateIn to the current time
	v.DateOut = time.Time{} // Reset DateOut as it's a new record

	return nil
}

// !!! ORACLE specific code !!!
