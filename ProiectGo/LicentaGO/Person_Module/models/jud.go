package models

import (
	"database/sql"
	"errors"
	"fmt"
)

type Jud struct {
	ID   int64  `json:"id_jud"`
	Name string `json:"name"`
}

// !!! AZURE SQL specific code !!!

func (j *Jud) GetJud(tx *sql.Tx) error {
	const selectQuery = `
        SELECT ID_JUD 
        FROM XXPerson.JUD 
        WHERE UPPER(NAME) = UPPER(@p1)`

	err := tx.QueryRow(selectQuery, j.Name).Scan(&j.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("jud not found: %w", err)
		}
		return fmt.Errorf("error querying Jud: %w", err)
	}

	return nil
}

func (j *Jud) UpdateJud(tx *sql.Tx) error {
	var existingID int64

	// SQL Server uses @p1 for parameter placeholders
	query := "SELECT ID_JUD FROM XXPerson.JUD WHERE UPPER(NAME) = UPPER(@p1)"

	// Execute the query to find if a Jud exists with the same name (case insensitive)
	err := tx.QueryRow(query, sql.Named("p1", j.Name)).Scan(&existingID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
		}
		return err
	}

	// If the Jud exists, set the ID
	j.ID = existingID
	return nil
}

// !!! ORACLE specific code !!!
