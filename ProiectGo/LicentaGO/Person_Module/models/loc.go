package models

import (
	"database/sql"
	"errors"
	"fmt"
	// go_ora "github.com/sijms/go-ora/v2"
)

type Loc struct {
	ID   int64  `json:"id_loc"`
	Name string `json:"name"`
	Jud  Jud    `json:"jud"`
}

// !!! AZURE SQL specific code !!!
func (l *Loc) GetLoc(tx *sql.Tx) error {
	const selectQuery = `
        SELECT ID_LOC 
        FROM XXPerson.LOC 
        WHERE UPPER(NAME) = UPPER(@p1) AND ID_JUD = @p2`

	err := tx.QueryRow(selectQuery, l.Name, l.Jud.ID).Scan(&l.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("Loc not found: %w", err)
		}
		return fmt.Errorf("error querying Loc: %w", err)
	}

	return nil
}

func (l *Loc) UpdateLoc(tx *sql.Tx) error {
	// First, update or create the related Jud (judet)
	err := l.Jud.UpdateJud(tx)
	if err != nil {
		return err
	}

	var existingID int64

	// SQL Server uses @p1, @p2 for parameter placeholders
	query := "SELECT ID_LOC FROM XXPerson.LOC WHERE UPPER(NAME) = UPPER(@p1) AND ID_JUD = @p2"

	// Execute the query to check if the Loc exists with the given name and ID_JUD
	err = tx.QueryRow(query, sql.Named("p1", l.Name), sql.Named("p2", l.Jud.ID)).Scan(&existingID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("loc not found")
		}
		return err
	}

	// If the Loc exists, set the ID
	l.ID = existingID
	return nil
}

// !!! ORACLE specific code !!!
