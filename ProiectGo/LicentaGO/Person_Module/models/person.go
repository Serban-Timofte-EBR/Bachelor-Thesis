package models

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"eoncohub.com/person_module/db"
	"eoncohub.com/person_module/utils"
)

var ErrPersonNotFound = errors.New("person not found or already expired")

type Person struct {
	IDPerson       int64          `json:"id_person"`
	FName          string         `json:"f_name"`
	LName          string         `json:"l_name"`
	CNP            string         `json:"cnp"`
	Sex            string         `json:"sex"`
	BornDate       time.Time      `json:"born_date"`
	Address        Address        `json:"address"`
	VirtualAddress VirtualAddress `json:"virtual_address"`
}

// !!! AZURE SQL specific code !!!

func (p *Person) Create() error {
	// Begin a new transaction
	tx, err := db.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() // This will be a no-op if the tx has been committed later

	// Create virtual address within the same transaction
	err = p.VirtualAddress.CreateVirtualAddress(tx)
	if err != nil {
		return fmt.Errorf("error creating virtual address: %w", err)
	}
	log.Printf("Created virtual address with ID: %d", p.VirtualAddress.ID)
	// Create address within the same transaction
	err = p.Address.CreateAddress(tx)
	if err != nil {
		return fmt.Errorf("error creating address: %w", err)
	}

	log.Printf("Created address with ID: %d", p.Address.IDAddress)
	// Prepare the SQL Server INSERT statement
	stmt, err := tx.Prepare(`
        INSERT INTO XXPerson.PERSONS (f_name, l_name, cnp, born_date, id_address, id_virtual_address, sex) 
        OUTPUT INSERTED.id_person
        VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Execute the statement and capture the inserted ID
	var newID int64
	err = stmt.QueryRow(
		p.FName, p.LName, p.CNP, p.BornDate, p.Address.IDAddress, p.VirtualAddress.ID, p.Sex,
	).Scan(&newID)
	if err != nil {
		return fmt.Errorf("error inserting person: %w", err)
	}

	// Set the new ID to the Person struct
	p.IDPerson = newID

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

func GetPerson(id int64) (Person, error) {
	var p Person
	// Define the SQL Server query with parameters
	query := `
        SELECT p.ID_PERSON,
               p.F_NAME,
               p.L_NAME,
               p.CNP,
               p.SEX,
               p.BORN_DATE,
               va.EMAIL,
               va.PHONE_NUMBER,
               ad.ADDRESS,
               l.NAME AS LOC_NAME,
               j.NAME AS JUD_NAME,
               va.DATE_IN
        FROM XXPerson.PERSONS p
        INNER JOIN XXPerson.VIRTUAL_ADDRESS va ON p.ID_VIRTUAL_ADDRESS = va.ID_VIRTUAL_ADDRESS
        INNER JOIN XXPerson.ADDRESS ad ON p.ID_ADDRESS = ad.ID_ADDRESS
        INNER JOIN XXPerson.LOC l ON ad.ID_LOC = l.ID_LOC
        INNER JOIN XXPerson.JUD j ON l.ID_JUD = j.ID_JUD
        WHERE p.ID_PERSON = @ID`

	// Execute the query and scan the result into the Person struct
	err := db.DB.QueryRow(query, sql.Named("ID", id)).Scan(
		&p.IDPerson,
		&p.FName,
		&p.LName,
		&p.CNP,
		&p.Sex,
		&p.BornDate,
		&p.VirtualAddress.Email,
		&p.VirtualAddress.PhoneNumber,
		&p.Address.Address,
		&p.Address.Loc.Name,
		&p.Address.Loc.Jud.Name,
		&p.VirtualAddress.DateIn)

	if err != nil {
		if err == sql.ErrNoRows {
			return Person{}, fmt.Errorf("no person found with id: %d", id)
		}
		return Person{}, fmt.Errorf("error getting person with id %d: %v", id, err)
	}

	return p, nil
}

func (p *Person) Update() error {
	tx, err := db.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Update Virtual Address if it is not empty
	if !utils.IsEmptyStruct(p.VirtualAddress) {
		var currentVirtualAddressID int64
		// Adjust SELECT query for SQL Server
		err = tx.QueryRow("SELECT ID_VIRTUAL_ADDRESS FROM XXPerson.PERSONS WHERE ID_PERSON = @p1", sql.Named("p1", p.IDPerson)).Scan(&currentVirtualAddressID)
		if err != nil {
			return fmt.Errorf("error getting current virtual address ID: %w", err)
		}
		p.VirtualAddress.ID = currentVirtualAddressID
		err = p.VirtualAddress.UpdateVirtualAddress(tx)
		if err != nil {
			return fmt.Errorf("error updating virtual address: %w", err)
		}

		// Update PERSONS table with the new virtual address ID
		_, err = tx.Exec("UPDATE XXPerson.PERSONS SET ID_VIRTUAL_ADDRESS = @p1 WHERE ID_PERSON = @p2", sql.Named("p1", p.VirtualAddress.ID), sql.Named("p2", p.IDPerson))
		if err != nil {
			return fmt.Errorf("error updating person's virtual address reference: %w", err)
		}
	}

	// Update Address if it is not empty
	if !utils.IsEmptyStruct(p.Address) {
		var currentAddressID int64
		// Adjust SELECT query for SQL Server
		err = tx.QueryRow("SELECT ID_ADDRESS FROM XXPerson.PERSONS WHERE ID_PERSON = @p1", sql.Named("p1", p.IDPerson)).Scan(&currentAddressID)
		if err != nil {
			return fmt.Errorf("error getting current address ID: %w", err)
		}
		p.Address.IDAddress = currentAddressID
		err = p.Address.UpdateAddress(tx)
		if err != nil {
			return fmt.Errorf("error updating address: %w", err)
		}

		// Update PERSONS table with the new address ID
		_, err = tx.Exec("UPDATE XXPerson.PERSONS SET ID_ADDRESS = @p1 WHERE ID_PERSON = @p2", sql.Named("p1", p.Address.IDAddress), sql.Named("p2", p.IDPerson))
		if err != nil {
			return fmt.Errorf("error updating person's address reference: %w", err)
		}
	}

	// Update person fields dynamically
	updateQuery := "UPDATE XXPerson.PERSONS SET "
	updateParams := []interface{}{}
	paramCount := 1

	if p.FName != "" {
		updateQuery += fmt.Sprintf("f_name = @p%d, ", paramCount)
		updateParams = append(updateParams, sql.Named(fmt.Sprintf("p%d", paramCount), p.FName))
		paramCount++
	}
	if p.LName != "" {
		updateQuery += fmt.Sprintf("l_name = @p%d, ", paramCount)
		updateParams = append(updateParams, sql.Named(fmt.Sprintf("p%d", paramCount), p.LName))
		paramCount++
	}
	if p.CNP != "" {
		updateQuery += fmt.Sprintf("cnp = @p%d, ", paramCount)
		updateParams = append(updateParams, sql.Named(fmt.Sprintf("p%d", paramCount), p.CNP))
		paramCount++
	}
	if !p.BornDate.IsZero() {
		updateQuery += fmt.Sprintf("born_date = @p%d, ", paramCount)
		updateParams = append(updateParams, sql.Named(fmt.Sprintf("p%d", paramCount), p.BornDate))
		paramCount++
	}

	// Remove trailing comma and space
	if len(updateParams) > 0 {
		updateQuery = updateQuery[:len(updateQuery)-2]
		updateQuery += fmt.Sprintf(" WHERE id_person = @p%d", paramCount)
		updateParams = append(updateParams, sql.Named(fmt.Sprintf("p%d", paramCount), p.IDPerson))

		// Execute the update if there are fields to update
		_, err = tx.Exec(updateQuery, updateParams...)
		if err != nil {
			return fmt.Errorf("error updating person: %w", err)
		}
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}
	return nil
}

func DeletePerson(personID int64) error {
	// Begin a new transaction
	tx, err := db.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Get and delete virtual address
	var virtualAddressID int64
	err = tx.QueryRow("SELECT ID_VIRTUAL_ADDRESS FROM XXPerson.PERSONS WHERE ID_PERSON = @p1", sql.Named("p1", personID)).Scan(&virtualAddressID)
	if err != nil {
		if err == sql.ErrNoRows {
			return ErrPersonNotFound
		}
		return err
	}

	// Get and delete address
	var addressID int64
	err = tx.QueryRow("SELECT ID_ADDRESS FROM XXPerson.PERSONS WHERE ID_PERSON = @p1", sql.Named("p1", personID)).Scan(&addressID)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	// Delete the person record
	result, err := tx.Exec("DELETE FROM XXPerson.PERSONS WHERE ID_PERSON = @p1", sql.Named("p1", personID))
	if err != nil {
		return err
	}

	// Delete address if it exists
	if addressID != 0 {
		_, err = tx.Exec("DELETE FROM XXPerson.ADDRESS WHERE ID_ADDRESS = @p1", sql.Named("p1", addressID))
		if err != nil {
			return err
		}
	}

	// Delete virtual address
	_, err = tx.Exec("DELETE FROM XXPerson.VIRTUAL_ADDRESS WHERE ID_VIRTUAL_ADDRESS = @p1", sql.Named("p1", virtualAddressID))
	if err != nil {
		return err
	}

	// Check if any rows were affected by the person delete operation
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrPersonNotFound
	}

	// Commit the transaction if all operations are successful
	return tx.Commit()
}

func GetAllPersons() ([]Person, error) {
	rows, err := db.DB.Query(
		`SELECT p.ID_PERSON,
		       p.F_NAME,
		       p.L_NAME,
		       p.CNP,
		       p.SEX,
		       p.BORN_DATE,
		       va.EMAIL,
		       va.PHONE_NUMBER,
		       ad.ADDRESS,
		       l.NAME AS LOC_NAME,
		       j.NAME AS JUD_NAME
		FROM XXPerson.PERSONS p
		LEFT JOIN XXPerson.VIRTUAL_ADDRESS va ON p.ID_VIRTUAL_ADDRESS = va.ID_VIRTUAL_ADDRESS
		LEFT JOIN XXPerson.ADDRESS ad ON p.ID_ADDRESS = ad.ID_ADDRESS
		LEFT JOIN XXPerson.LOC l ON ad.ID_LOC = l.ID_LOC
		LEFT JOIN XXPerson.JUD j ON l.ID_JUD = j.ID_JUD
	`)
	if err != nil {
		return nil, errors.New("error getting all persons")
	}
	defer rows.Close()

	var persons []Person
	for rows.Next() {
		var p Person
		var fName, lName, cnp, sex sql.NullString
		var bornDate sql.NullTime
		var email, phoneNumber, address, locName, judName sql.NullString

		// Scan values from the result set
		err := rows.Scan(
			&p.IDPerson,
			&fName,
			&lName,
			&cnp,
			&sex,
			&bornDate,
			&email,
			&phoneNumber,
			&address,
			&locName,
			&judName,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning person: %w", err)
		}

		// Assign values to the person object
		p.FName = fName.String
		p.LName = lName.String
		p.CNP = cnp.String
		p.Sex = sex.String
		if bornDate.Valid {
			p.BornDate = bornDate.Time
		}

		// Assign virtual address details if available
		p.VirtualAddress.Email = email.String
		p.VirtualAddress.PhoneNumber = phoneNumber.String

		// Assign address details if available
		p.Address.Address = address.String
		p.Address.Loc.Name = locName.String
		p.Address.Loc.Jud.Name = judName.String

		persons = append(persons, p)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over persons: %w", err)
	}

	return persons, nil
}

// !!! Oracle SQL specific code !!!
