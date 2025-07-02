package models

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
)

type Address struct {
	IDAddress int64  `json:"id_address"`
	Loc       Loc    `json:"loc"`
	Address   string `json:"address"`
}

func (a *Address) CreateAddress(tx *sql.Tx) error {
	// Create Jud (Judiciary) entry within the same transaction
	err := a.Loc.Jud.GetJud(tx)
	if err != nil {
		return fmt.Errorf("error creating Jud: %w", err)
	}
	log.Printf("Jud ID: %d", a.Loc.Jud.ID)

	// Create Loc (Location) entry within the same transaction
	err = a.Loc.GetLoc(tx)
	if err != nil {
		return fmt.Errorf("error creating Loc: %w", err)
	}

	log.Printf("Loc ID: %d", a.Loc.ID)
	// Define the SQL Server INSERT statement
	const insertQuery = `
        INSERT INTO XXPerson.ADDRESS (ID_LOC, ADDRESS) 
        OUTPUT INSERTED.ID_ADDRESS
        VALUES (@p1, @p2)`

	// Prepare the statement
	stmt, err := tx.Prepare(insertQuery)
	if err != nil {
		return err
	}
	defer func(stmt *sql.Stmt) {
		err := stmt.Close()
		if err != nil {

		}
	}(stmt)

	// Execute the statement and capture the inserted ID
	err = stmt.QueryRow(a.Loc.ID, a.Address).Scan(&a.IDAddress)
	log.Println(a.IDAddress)
	if err != nil {
		return fmt.Errorf("error inserting Address: %w", err)
	}

	return nil
}

func (a *Address) UpdateAddress(tx *sql.Tx) error {
	// Update the associated Loc (location) first
	err := a.Loc.UpdateLoc(tx)
	if err != nil {
		return err
	}

	// Check if Address exists
	var exists int
	err = tx.QueryRow("SELECT 1 FROM XXPerson.ADDRESS WHERE ID_ADDRESS = @p1", a.IDAddress).Scan(&exists)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// If not exists, create a new Address
			return a.CreateAddress(tx)
		}
		return err
	}

	// If exists, update the Address
	stmt, err := tx.Prepare("UPDATE XXPerson.ADDRESS SET ID_LOC = @p1, ADDRESS = @p2 WHERE ID_ADDRESS = @p3")
	if err != nil {
		return err
	}
	defer func(stmt *sql.Stmt) {
		err := stmt.Close()
		if err != nil {

		}
	}(stmt)

	// Execute the statement
	_, err = stmt.Exec(a.Loc.ID, a.Address, a.IDAddress)
	if err != nil {
		return err
	}

	return nil
}
