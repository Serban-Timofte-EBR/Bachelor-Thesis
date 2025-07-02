import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Card,
  CardMedia,
  Box,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ESMOGuidelines from "./ESMOGuidelines";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e91e63",
    },
  },
});

function PatientInfoTab() {
  const [protocolFile, setProtocolFile] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [imageVideoFile, setImageVideoFile] = useState(null);
  const [bloodTestFile, setBloodTestFile] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [outsideGuidelines, setOutsideGuidelines] = useState(false);

  const handleMarkOutsideGuidelines = () => {
    try {
      // API call to mark patient as outside guidelines
      setOutsideGuidelines(!outsideGuidelines);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setProtocolFile({
      file: null,
      preview: "/documents/protocol.pdf",
    });
    setReportFile({
      file: null,
      preview: "/documents/demoRaportRMN.pdf",
    });
    setImageVideoFile({
      file: null,
      preview: "/documents/demoRMN.jpeg",
    });
    setBloodTestFile({
      file: null,
      preview: "/documents/BloodTest.pdf",
    });

    // Simulate AI summarization process
    const summaryText =
      "Summary: The patient has been responding well to the treatment. The recent tests indicate a significant reduction in tumor size. Continue with the current treatment plan and monitor closely for any changes.";
    setTimeout(() => {
      setAiSummary(summaryText);
      setLoadingSummary(false);
    }, 2000);
  }, []);

  const kpis = [
    { label: "ER (Estrogen Receptor)", value: 21 },
    { label: "PR (Progesterone Receptor)", value: 32 },
    { label: "HER2", value: 18 },
    { label: "Ki67", value: 15 },
    { label: "TNM", value: "T2N0M0" },
    { label: "Tip Histologic", value: "Invasive Ductal Carcinoma" },
    { label: "Grad Histologic", value: 2 },
    { label: "Carcinom in situ", value: "No" },
    { label: "Grad nuclear histologic", value: 3 },
    { label: "Stadiu", value: "Advanced" },
  ];

  const esmoGuidelines = {
    firstLineTreatment: {
      title: "Prima linie de tratament",
      items: [
        {
          titleItem: "Chimioterapie Contraindicata:",
          indication: "Trastuzumab + ET + Pertuzumab (Opțional)",
          alternativeIndication: null,
        },
        {
          titleItem: "Fara chimioterapie Contraindicata:",
          indication:
            "Docetaxel / Paclitaxel + Trastuzumab + Pertuzumab (Opțional)",
          alternativeIndication: null,
        },
        {
          titleItem: "Observatie:",
          indication:
            "Cel putin 6 cicluri, urmat de: Trastuzumab + (Pertuzumab)  + ET until progression",
          alternativeIndication: null,
        },
      ],
    },
    diseaseProgression: {
      title: "Progresia bolii",
      items: [
        {
          titleItem:
            "Metastaze celulare active & Local intervention indicated:",
          indication: "SRT",
          alternativeIndication: null,
        },
        {
          titleItem:
            "Metastaze celulare active & Local intervention contraindicated",
          indication: "Tucatinimb + Catecitabina + Trastuzumab",
          alternativeIndication: "Trastuzumab + Deruxtecan",
        },
        {
          titleItem: "Fără metastaze cerebrale cunoscute",
          indication: "Trastuzumab + Deruxtecan",
          alternativeIndication: "T-DM1",
        },
      ],
    },
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const diagnosis = "Luminal B - HER2 -";

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              padding: 2,
              marginBottom: 3,
              borderRadius: 2,
              borderBottom: "2px solid",
              borderColor: theme.palette.primary.main,
              backgroundColor: "transparent",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
            >
              Diagnosis
            </Typography>
            <Typography variant="body1">
              {diagnosis ? diagnosis : "To be determined"}
            </Typography>
          </Box>

          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Patient KPIs
            </Typography>
            {kpis.map((kpi, index) => (
              <Typography key={index} variant="body1">
                {`${kpi.label}: ${kpi.value}`}
              </Typography>
            ))}
          </Paper>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "background.paper", // Add background for visibility
              borderRadius: 2,
              p: 1,
              boxShadow: 1, // Slight shadow for elevation
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={outsideGuidelines}
                  onChange={handleMarkOutsideGuidelines}
                  color="secondary"
                  sx={{
                    "& .MuiSwitch-switchBase": {
                      "&.Mui-checked": {
                        color: "#e91e63",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(233, 30, 99, 0.08)",
                      },
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: outsideGuidelines
                        ? "#e91e63"
                        : "#d0d0d0",
                    },
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <WarningAmberOutlinedIcon
                    sx={{
                      color: outsideGuidelines
                        ? "secondary.main"
                        : "text.secondary",
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: outsideGuidelines
                        ? "secondary.main"
                        : "text.primary",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {outsideGuidelines
                      ? "Marked as Outside Guidelines"
                      : "Mark as Outside Guidelines"}
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              mt: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
            >
              E-OncoHub Assistant Brief Patient Summary
            </Typography>
            {loadingSummary ? (
              <>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Summarizing notes...</Typography>
              </>
            ) : (
              <Typography
                variant="body1"
                sx={{ mt: 2, whiteSpace: "pre-wrap" }}
              >
                {aiSummary}
              </Typography>
            )}
          </Paper>

          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mt: 2 }}>
            <ESMOGuidelines guidelines={esmoGuidelines} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ marginBottom: 1 }}>
            Documents Section
          </Typography>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Protocol carcinom mamar invaziv
                </Typography>
                {protocolFile && (
                  <IconButton
                    color="primary"
                    onClick={() => window.open(protocolFile.preview, "_blank")}
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
              </Box>
              {protocolFile && (
                <Card sx={{ height: 300, overflow: "auto", mb: 3 }}>
                  <CardMedia
                    component="iframe"
                    src={protocolFile.preview}
                    title="Protocol File"
                    sx={{ height: "100%", width: "100%" }}
                  />
                </Card>
              )}
              <Divider />
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Raport
                </Typography>
                {reportFile && (
                  <IconButton
                    color="primary"
                    onClick={() => window.open(reportFile.preview, "_blank")}
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
              </Box>
              {reportFile && (
                <Card sx={{ height: 300, overflow: "auto", mb: 3 }}>
                  <CardMedia
                    component="iframe"
                    src={reportFile.preview}
                    title="Report File"
                    sx={{ height: "100%", width: "100%" }}
                  />
                </Card>
              )}
              <Divider />
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  RMN / PET - CT / CT
                </Typography>
                {imageVideoFile && (
                  <IconButton
                    color="primary"
                    onClick={() =>
                      window.open(imageVideoFile.preview, "_blank")
                    }
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
              </Box>
              {imageVideoFile && (
                <Card sx={{ height: 300, overflow: "auto", mb: 3 }}>
                  <CardMedia
                    component="iframe"
                    src={imageVideoFile.preview}
                    title="Image/Video File"
                    sx={{ height: "100%", width: "100%" }}
                  />
                </Card>
              )}
              <Divider />
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Blood Test
                </Typography>
                {bloodTestFile && (
                  <IconButton
                    color="primary"
                    onClick={() => window.open(bloodTestFile.preview, "_blank")}
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
              </Box>
              {bloodTestFile && (
                <Card sx={{ height: 300, overflow: "auto", mb: 3 }}>
                  <CardMedia
                    component="iframe"
                    src={bloodTestFile.preview}
                    title="Blood Test File"
                    sx={{ height: "100%", width: "100%" }}
                  />
                </Card>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          Please upload the required documents.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default PatientInfoTab;
