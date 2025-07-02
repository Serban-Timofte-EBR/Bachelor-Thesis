import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import { motion } from "framer-motion";
import {
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MainLayout from "../../layout/MainLayout";
import {
  createConsultation,
  resetState,
} from "../../redux/slices/consultationSlice";
import { useNavigate, useParams } from "react-router-dom";
import validateFiles from "../helpers/validation";

const theme = createTheme({
  palette: {
    primary: {
      main: pink[500], // Breast cancer pink color
    },
  },
});

const steps = ["Enter KPIs", "Add Notes", "Upload Files", "Review & Submit"];

const NewConsultation = () => {
  const dispatch = useDispatch();
  const { loading, successMessage, errorMessage } = useSelector(
    (state) => state.consultations,
  );

  const { id } = useParams();

  const [kpis, setKpis] = useState([
    { label: "ER (Estrogen Receptor)", value: "", required: true },
    { label: "PR (Progesterone Receptor)", value: "", required: true },
    { label: "HER2", value: "", required: true },
    { label: "Ki67", value: "", required: true },
    { label: "TNM", value: "", required: true },
    { label: "Histologic Type", value: "", required: true },
    { label: "Histologic Grade", value: "", required: true },
    { label: "Carcinoma in situ", value: "", required: false },
    { label: "Nuclear Histologic Grade", value: "", required: false },
    { label: "Stage", value: "", required: true },
  ]);

  const [uploadedFiles, setUploadedFiles] = useState({
    protocol: null,
    report: null,
    rmn: null,
    blood: null,
  });

  const [notes, setNotes] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [cytostatic, setCytostatic] = useState("");
  const [sessions, setSessions] = useState("");
  const [organFailureRisk, setOrganFailureRisk] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const navigate = useNavigate();

  const handleToggleRisk = () => {
    setOrganFailureRisk((prev) => !prev);
  };

  const handleKpiChange = (index, newValue) => {
    const newKpis = [...kpis];
    newKpis[index].value = newValue;
    setKpis(newKpis);
  };

  const ValidationErrorDisplay = () => {
    if (!showValidationErrors || validationErrors.length === 0) return null;

    return (
      <Alert
        severity="error"
        sx={{ mt: 2, mb: 2 }}
        onClose={() => setShowValidationErrors(false)}
      >
        <AlertTitle>Please correct the following errors:</AlertTitle>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </Alert>
    );
  };

  const handleFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: file,
      }));

      if (type === "protocol") {
        const extractedKpis = [
          { label: "ER (Estrogen Receptor)", value: "20", required: true },
          { label: "PR (Progesterone Receptor)", value: "30", required: true },
          { label: "HER2", value: "-17", required: true },
          { label: "Ki67", value: "14", required: true },
          { label: "TNM", value: "T2N0M1", required: true },
          {
            label: "Histologic Type",
            value: "Invasive Lobular Carcinoma",
            required: true,
          },
          { label: "Histologic Grade", value: "3", required: true },
          { label: "Carcinoma in situ", value: "Yes", required: false },
          { label: "Nuclear Histologic Grade", value: "2", required: false },
          { label: "Stage", value: "Early", required: true },
        ];
        setKpis(extractedKpis);
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateKpis()) {
      setOpenSnackbar(true);
      return;
    }
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateKpis = () => {
    return kpis.every((kpi) => (kpi.required ? kpi.value.trim() !== "" : true));
  };

  const handleSubmit = async () => {
    const fileErrors = validateFiles(uploadedFiles);

    if (fileErrors.length > 0) {
      setValidationErrors(fileErrors);
      setShowValidationErrors(true);
      return;
    }
    const formData = new FormData();
    const appointmentDate = new Date().toISOString();

    const jsonPayload = {
      Appointment_Date: appointmentDate,
      ER: parseInt(kpis[0].value),
      PR: parseInt(kpis[1].value),
      HER2: parseInt(kpis[2].value),
      Ki67: parseInt(kpis[3].value),
      TNM: kpis[4].value,
      "Histologic Type": kpis[5].value,
      "Histologic Grade": parseInt(kpis[6].value),
      "Carcinoma in situ": kpis[7].value,
      "Nuclear Histologic Grade": parseInt(kpis[8].value),
      Stage: kpis[9].value,
      SLT_Organ_Failure: organFailureRisk ? 1 : 0,
      Treatement_Cytostatic: cytostatic,
      Recommended_Nr_Of_Sessions: parseInt(sessions),
      Id_patient: parseInt(id),
      Notes: notes,
    };

    console.log(jsonPayload); // For debugging

    formData.append("json", JSON.stringify(jsonPayload));
    formData.append("protocol", uploadedFiles.protocol);
    formData.append("report", uploadedFiles.report);
    formData.append("rmn", uploadedFiles.rmn);
    formData.append("blood", uploadedFiles.blood);

    try {
      const result = await dispatch(createConsultation({ formData }));
      navigate(`/patients/${id}/last-information`);
    } catch (e) {
      console.error("Error creating consultation:", e);
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(resetState());
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Enter Key Performance Indicators (KPIs)
              </Typography>
              <Grid container spacing={2}>
                {kpis.map((kpi, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <TextField
                      fullWidth
                      label={kpi.label}
                      value={kpi.value}
                      onChange={(e) => handleKpiChange(index, e.target.value)}
                      variant="outlined"
                      required={kpi.required}
                      InputLabelProps={{
                        style: { color: theme.palette.primary.main },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "default",
                          },
                          "&:hover fieldset": {
                            borderColor: "default",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              {/* Upload Protocol Document */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderColor: uploadedFiles.protocol ? "green" : "grey.300",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <input
                  accept="application/pdf"
                  style={{ display: "none" }}
                  id="upload-protocol"
                  type="file"
                  onChange={handleFileUpload("protocol")}
                />
                <label htmlFor="upload-protocol">
                  <Tooltip title="Upload Protocol Document">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{ fontSize: 60 }}
                    >
                      {uploadedFiles.protocol ? (
                        <CheckCircleIcon
                          color="success"
                          sx={{ fontSize: 60 }}
                        />
                      ) : (
                        <UploadFileIcon sx={{ fontSize: 60 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </label>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  {uploadedFiles.protocol
                    ? "Protocol Uploaded"
                    : "Upload Protocol Document"}
                </Typography>
                {uploadedFiles.protocol && (
                  <Typography variant="body2" color="textSecondary">
                    {uploadedFiles.protocol.name}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Cytostatic Treatment
                </Typography>
                <TextField
                  fullWidth
                  value={cytostatic}
                  onChange={(e) => setCytostatic(e.target.value)}
                  placeholder="Enter cytostatic treatment"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "default",
                      },
                      "&:hover fieldset": {
                        borderColor: "default",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Recommended Sessions
                </Typography>
                <TextField
                  fullWidth
                  value={sessions}
                  onChange={(e) => setSessions(e.target.value)}
                  placeholder="Enter recommended sessions"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "default",
                      },
                      "&:hover fieldset": {
                        borderColor: "default",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Add Consultation Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter consultation notes here..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "default",
                      },
                      "&:hover fieldset": {
                        borderColor: "default",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Risk of Organ Failure
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={organFailureRisk}
                        onChange={handleToggleRisk}
                        color="primary"
                        sx={{
                          transform: "scale(1.5)",
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: theme.palette.primary.main,
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: theme.palette.primary.main,
                            },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {organFailureRisk ? "Yes" : "No"}
                      </Typography>
                    }
                    sx={{ marginRight: 2 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Upload Required Files
            </Typography>
            <Grid container spacing={4}>
              {["protocol", "report", "rmn", "blood"].map((type) => (
                <Grid item xs={12} sm={4} key={type}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderColor: uploadedFiles[type] ? "green" : "grey.300",
                    }}
                  >
                    <input
                      accept="application/pdf,image/*"
                      style={{ display: "none" }}
                      id={`upload-${type}`}
                      type="file"
                      onChange={handleFileUpload(type)}
                    />
                    <label htmlFor={`upload-${type}`}>
                      <Tooltip
                        title={`Upload ${type.replace("_", " ").toUpperCase()}`}
                      >
                        <IconButton
                          color="primary"
                          component="span"
                          sx={{ fontSize: 50 }}
                        >
                          {uploadedFiles[type] ? (
                            <CheckCircleIcon
                              color="success"
                              sx={{ fontSize: 50 }}
                            />
                          ) : (
                            <CloudUploadIcon sx={{ fontSize: 50 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </label>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      {type.replace("_", " ").toUpperCase()}
                    </Typography>
                    {uploadedFiles[type] && (
                      <Typography variant="body2" color="textSecondary">
                        {uploadedFiles[type].name}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Review & Confirm
            </Typography>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                KPIs:
              </Typography>
              <Grid container spacing={1}>
                {kpis.map((kpi, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Typography variant="body2">
                      {kpi.label}: {kpi.value || "N/A"}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Card>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Notes:
              </Typography>
              <Typography variant="body2">
                {notes || "No additional notes."}
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Uploaded Files:
              </Typography>
              <Grid container spacing={1}>
                {["protocol", "report", "rmn", "blood"].map((type) => (
                  <Grid item xs={12} sm={6} key={type}>
                    <Typography variant="body2">
                      {type.charAt(0).toUpperCase() + type.slice(1)}:{" "}
                      {uploadedFiles[type]
                        ? uploadedFiles[type].name
                        : "Not uploaded"}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <MainLayout>
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <ValidationErrorDisplay />
          <Typography variant="h4" gutterBottom>
            New Consultation
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-completed": { color: pink[500] },
                      "&.Mui-active": { color: pink[500] },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            {getStepContent(activeStep)}
          </motion.div>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={
                activeStep === steps.length - 1 ? (
                  loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CheckCircleIcon />
                  )
                ) : null
              }
            >
              {activeStep === steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </Box>

          <Snackbar
            open={!!successMessage || !!errorMessage}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            {successMessage ? (
              <Alert onClose={handleCloseSnackbar} severity="success">
                {successMessage}
              </Alert>
            ) : (
              <Alert onClose={handleCloseSnackbar} severity="error">
                {errorMessage}
              </Alert>
            )}
          </Snackbar>
        </Container>
      </ThemeProvider>
    </MainLayout>
  );
};

export default NewConsultation;
