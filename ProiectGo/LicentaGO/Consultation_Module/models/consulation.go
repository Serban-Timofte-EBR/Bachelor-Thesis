package models

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"eoncohub.com/consulation_module/db"
	"eoncohub.com/consulation_module/rag"
)

type ConsultationRequest struct {
	AppointmentDate         time.Time `json:"Appointment_Date" time_format:"2006-01-02T15:04:05Z"`
	ER                      int       `json:"ER"`
	PR                      int       `json:"PR"`
	HER2                    int       `json:"HER2"`
	Ki67                    int       `json:"Ki67"`
	TNM                     string    `json:"TNM"`
	HistologicType          string    `json:"Histologic Type"`
	HistologicGrade         int       `json:"Histologic Grade"`
	CarcinomaInSitu         string    `json:"Carcinoma in situ"`
	NuclearHistologicGrade  int       `json:"Nuclear Histologic Grade"`
	Stage                   string    `json:"Stage"`
	SLTOrganFailure         int       `json:"SLT_Organ_Failure"`
	TreatmentCytostatic     string    `json:"Treatement_Cytostatic"`
	RecommendedNrOfSessions int       `json:"Recommended_Nr_Of_Sessions"`
	IdPatient               int       `json:"Id_patient"`
	Notes                   string    `json:"Notes"`
	ProtocolUrl             string    `json:"Protocol_Document"`
	ReportUrl               string    `json:"Report_Document"`
	BloodUrl                string    `json:"Blood_Document"`
	RmnUrl                  string    `json:"RMN_Document"`
	Diagnostic              string    `json:"Diagnostic"`
}

func (c *ConsultationRequest) ToRAG() *rag.ConsultationRequest {
	return &rag.ConsultationRequest{
		ER:             c.ER,
		PR:             c.PR,
		HER2:           c.HER2,
		Ki67:           c.Ki67,
		TNM:            c.TNM,
		HistologicType: c.HistologicType,
		Stage:          c.Stage,
	}
}

func GetLastConsultation(idDoctor int64, idPatient int64) (*ConsultationRequest, error) {
	var consultation ConsultationRequest
	query := `
	SELECT TOP 1
		A.APPOINTMENT_DATE,
		PR.ER,
		PR.PR,
		PR.HER2,
		PR.KI67,
		PR.TNM,
		PR.HISTOLOGIC_TYPE,
		PR.HISTOLOGIC_GRADE,
		PR.CARCINOM_IN_SITU,
		PR.NUCLEAR_HISTOLOGIC_GRADE,
		PR.DIAGNOSTIC,
		I.SLT_ORGAN_FAILURE,
		T.TREATMENT_CYTOSTATIC,
		T.RECOMMENDED_NR_OF_SESSIONS,
		A.ID_PATIENT,
		I.NOTES,
		PR.PROTOCOL_CARC_MAM_INVAZ AS ProtocolUrl,
		I.REPORT AS ReportUrl,
		I.BLOOD_ANALYSIS AS BloodUrl,
		I.RNM_REPORT AS RmnUrl,
		PR.stage
	FROM XXConsultations.APPOINTMENTS A
	JOIN XXConsultations.INFORMATIONS I ON I.ID_INFORMATION = A.ID_INFORMATION
	JOIN XXConsultations.PROTOCOL_RESULTS PR ON PR.ID_INFORMATION = I.ID_INFORMATION
	JOIN XXConsultations.TREATMENTS T ON T.ID_INFORMATION = I.ID_INFORMATION
	WHERE A.ID_DOCTOR_HOSPITAL = @doctorID AND A.ID_PATIENT = @patientID
	ORDER BY A.APPOINTMENT_DATE DESC`

	err := db.DB.QueryRow(query,
		sql.Named("doctorID", idDoctor),
		sql.Named("patientID", idPatient),
	).Scan(
		&consultation.AppointmentDate,
		&consultation.ER,
		&consultation.PR,
		&consultation.HER2,
		&consultation.Ki67,
		&consultation.TNM,
		&consultation.HistologicType,
		&consultation.HistologicGrade,
		&consultation.CarcinomaInSitu,
		&consultation.NuclearHistologicGrade,
		&consultation.Diagnostic,
		&consultation.SLTOrganFailure,
		&consultation.TreatmentCytostatic,
		&consultation.RecommendedNrOfSessions,
		&consultation.IdPatient,
		&consultation.Notes,
		&consultation.ProtocolUrl,
		&consultation.ReportUrl,
		&consultation.BloodUrl,
		&consultation.RmnUrl,
		&consultation.Stage,
	)

	if err != nil {
		return nil, fmt.Errorf("you don't have any consultations")
	}
	return &consultation, nil
}
func GetAllConsultations(idDoctor int64, idPatient int64) ([]ConsultationRequest, error) {
	query := `
	SELECT
		A.APPOINTMENT_DATE,
		PR.ER,
		PR.PR,
		PR.HER2,
		PR.KI67,
		PR.TNM,
		PR.HISTOLOGIC_TYPE,
		PR.HISTOLOGIC_GRADE,
		PR.CARCINOM_IN_SITU,
		PR.NUCLEAR_HISTOLOGIC_GRADE,
		PR.DIAGNOSTIC,
		I.SLT_ORGAN_FAILURE,
		T.TREATMENT_CYTOSTATIC,
		T.RECOMMENDED_NR_OF_SESSIONS,
		A.ID_PATIENT,
		I.NOTES,
		PR.PROTOCOL_CARC_MAM_INVAZ AS ProtocolUrl,
		I.REPORT AS ReportUrl,
		I.BLOOD_ANALYSIS AS BloodUrl,
		I.RNM_REPORT AS RmnUrl,
		PR.stage
	FROM XXConsultations.APPOINTMENTS A
	JOIN XXConsultations.INFORMATIONS I ON I.ID_INFORMATION = A.ID_INFORMATION
	JOIN XXConsultations.PROTOCOL_RESULTS PR ON PR.ID_INFORMATION = I.ID_INFORMATION
	JOIN XXConsultations.TREATMENTS T ON T.ID_INFORMATION = I.ID_INFORMATION
	WHERE A.ID_DOCTOR_HOSPITAL = @doctorID AND A.ID_PATIENT = @patientID
	ORDER BY A.APPOINTMENT_DATE DESC`

	rows, err := db.DB.Query(query,
		sql.Named("doctorID", idDoctor),
		sql.Named("patientID", idPatient),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query consultations: %v", err)
	}
	defer rows.Close()

	var consultations []ConsultationRequest

	for rows.Next() {
		var consultation ConsultationRequest
		err := rows.Scan(
			&consultation.AppointmentDate,
			&consultation.ER,
			&consultation.PR,
			&consultation.HER2,
			&consultation.Ki67,
			&consultation.TNM,
			&consultation.HistologicType,
			&consultation.HistologicGrade,
			&consultation.CarcinomaInSitu,
			&consultation.NuclearHistologicGrade,
			&consultation.Diagnostic,
			&consultation.SLTOrganFailure,
			&consultation.TreatmentCytostatic,
			&consultation.RecommendedNrOfSessions,
			&consultation.IdPatient,
			&consultation.Notes,
			&consultation.ProtocolUrl,
			&consultation.ReportUrl,
			&consultation.BloodUrl,
			&consultation.RmnUrl,
			&consultation.Stage,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan consultation: %v", err)
		}
		consultations = append(consultations, consultation)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over consultations: %v", err)
	}
	return consultations, nil
}

func (c *ConsultationRequest) CreateConsultation(idDoctor int64) (int64, error) {
	tx, err := db.DB.Begin()
	if err != nil {
		return 0, fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	var informationID int64
	err = tx.QueryRow(`
        INSERT INTO XXConsultations.INFORMATIONS (NOTES, BLOOD_ANALYSIS, RNM_REPORT, SLT_ORGAN_FAILURE, REPORT)
        OUTPUT INSERTED.ID_INFORMATION
        VALUES (@p1, @p2, @p3, @p4, @p5)
    `, c.Notes, c.BloodUrl, c.RmnUrl, c.SLTOrganFailure, c.ReportUrl).Scan(&informationID)
	if err != nil {
		return 0, fmt.Errorf("failed to insert into INFORMATIONS: %v", err)
	}
	log.Printf("Before date: %v", c.AppointmentDate)

	// Insert into APPOINTMENTS table
	if c.AppointmentDate.IsZero() {
		// set the appointment date to the current date
		c.AppointmentDate = time.Now()
	}

	formattedDateTime := c.AppointmentDate.Format("2006-01-02 15:04:00")
	log.Printf("Appointment date: %v", c.AppointmentDate)

	var idAppointment int64

	err = tx.QueryRow(`
        INSERT INTO XXConsultations.APPOINTMENTS (ID_PATIENT, ID_DOCTOR_HOSPITAL, APPOINTMENT_DATE, ID_INFORMATION)
        OUTPUT INSERTED.ID_APPOINTMENT
        VALUES (@p1, @p2, @p3, @p4)
    `, c.IdPatient, idDoctor, formattedDateTime, informationID).Scan(&idAppointment)
	if err != nil {
		return 0, fmt.Errorf("failed to insert into APPOINTMENTS: %v", err)
	}

	// Determine diagnostic
	ragService := rag.NewDiagnosticService(
		rag.NewAzureSearchClient(),
		rag.NewLLMClient(),
	)
	ctx := context.Background()

	ragReq := c.ToRAG()
	result, err := ragService.DetermineDiagnostic(ctx, ragReq)
	if err != nil {
		log.Printf("Warning: fallback to static logic, error: %v", err)
		c.Diagnostic, _ = fallbackDetermineDiagnostic(c)
	} else {
		c.Diagnostic = result.Diagnostic
	}

	// Insert into PROTOCOL_RESULTS table
	_, err = tx.Exec(`
        INSERT INTO XXConsultations.PROTOCOL_RESULTS (
            id_information, protocol_carc_mam_invaz, er, pr, her2, tnm, histologic_type, histologic_grade, carcinom_in_situ, nuclear_histologic_grade, diagnostic, ki67, stage
        ) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13)
    `, informationID, c.ProtocolUrl, c.ER, c.PR, c.HER2, c.TNM, c.HistologicType, c.HistologicGrade, c.CarcinomaInSitu, c.NuclearHistologicGrade, c.Diagnostic, c.Ki67, c.Stage)
	if err != nil {
		return 0, fmt.Errorf("failed to insert into PROTOCOL_RESULTS: %v", err)
	}

	// Insert into TREATMENTS table
	_, err = tx.Exec(`INSERT INTO XXConsultations.TREATMENTS (ID_INFORMATION, TREATMENT_CYTOSTATIC,RECOMMENDED_NR_OF_SESSIONS ) VALUES (@p1, @p2, @p3)`, informationID, c.TreatmentCytostatic, c.RecommendedNrOfSessions)
	if err != nil {
		return 0, fmt.Errorf("failed to insert into TREATMENTS: %v", err)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return idAppointment, nil
}

func fallbackDetermineDiagnostic(request *ConsultationRequest) (string, error) {
	const (
		erThreshold   = 1
		prThreshold   = 1
		her2Threshold = 10
		ki67Threshold = 14
	)

	switch {
	case request.ER >= erThreshold && request.PR >= prThreshold && request.HER2 < her2Threshold:
		if request.Ki67 <= ki67Threshold {
			return "Luminal A", nil
		} else {
			return "Luminal B like HER2 negative", nil
		}

	case request.ER >= erThreshold && request.HER2 >= her2Threshold:
		return "Luminal B like HER2 positive", nil

	case request.ER < erThreshold && request.PR < prThreshold && request.HER2 < her2Threshold:
		return "Triple Negative Breast Cancer (TNBC)", nil

	default:
		return "", errors.New("unable to determine diagnostic based on provided values")
	}
}
