import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Paper,
  FormControlLabel,
  Switch,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchLastConsultation } from "../../redux/slices/consultationSlice";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import { TabContext, TabPanel } from "@mui/lab";
import MainLayout from "../../layout/MainLayout";
import ESMOGuidelines from "../Patient-profile/ESMOGuidelines";

const theme = createTheme({
  palette: {
    primary: {
      main: pink[500],
    },
    secondary: {
      main: "#f50057",
    },
  },
});

const LastInformation = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { consultationData, loading, errorMessage } = useSelector(
    (state) => state.consultations,
  );

  const [tabValue, setTabValue] = useState("1");
  const [outsideGuidelines, setOutsideGuidelines] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [aiSummary, setAiSummary] = useState("");

  const handleMarkOutsideGuidelines = () => {
    try {
      setOutsideGuidelines(!outsideGuidelines);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    dispatch(fetchLastConsultation({ id }));

    const summaryText =
      "The patient has been responding well to the treatment. The recent tests indicate a significant reduction in tumor size. Continue with the current treatment plan and monitor closely for any changes.";
    setTimeout(() => {
      setAiSummary(summaryText);
      setLoadingSummary(false);
    }, 2000);
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#e91e63" }} />
      </Box>
    );
  }

  if (consultationData?.error) {
    return (
      <MainLayout>
        <ThemeProvider theme={theme}>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Last Consultation Information
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                {consultationData.error}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Please contact the administrator for further assistance.
              </Typography>
            </Box>
          </Container>
        </ThemeProvider>
      </MainLayout>
    );
  }

  if (!consultationData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "#e91e63", fontWeight: "bold", mb: 2 }}
        >
          No Consultation Data Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          We couldn't find any consultation data for this patient. Please ensure
          that the consultation records are up to date or try again later.
        </Typography>
        <Typography bold>Please go back to check other patient!</Typography>
      </Box>
    );
  }

  return (
    <MainLayout>
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Last Consultation Information
          </Typography>
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mb: 2,
                        bgcolor: pink[500],
                      }}
                    >
                      {consultationData.Diagnostic?.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {consultationData.Diagnostic}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Consultation Date:{" "}
                      {new Date(
                        consultationData.Appointment_Date,
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* KPIs */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Patient KPIs
                    </Typography>
                    <Typography variant="body2">
                      ER: {consultationData.ER}
                    </Typography>
                    <Typography variant="body2">
                      PR: {consultationData.PR}
                    </Typography>
                    <Typography variant="body2">
                      HER2: {consultationData.HER2}
                    </Typography>
                    <Typography variant="body2">
                      Ki67: {consultationData.Ki67}
                    </Typography>
                    <Typography variant="body2">
                      TNM: {consultationData.TNM}
                    </Typography>
                    <Typography variant="body2">
                      Histologic Type: {consultationData["Histologic Type"]}
                    </Typography>
                    <Typography variant="body2">
                      Histologic Grade: {consultationData["Histologic Grade"]}
                    </Typography>
                    <Typography variant="body2">
                      Carcinoma in situ: {consultationData["Carcinoma in situ"]}
                    </Typography>
                    <Typography variant="body2">
                      Nuclear Histologic Grade:{" "}
                      {consultationData["Nuclear Histologic Grade"]}
                    </Typography>
                    <Typography variant="body2">
                      Stage: {consultationData.Stage}
                    </Typography>
                    <Typography variant="body2">
                      SLT Organ Failure:{" "}
                      {consultationData["SLT_Organ_Failure"] ? "True" : "False"}
                    </Typography>
                  </Box>

                  {/* Mark as Outside Guidelines */}
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "background.paper",
                      borderRadius: 2,
                      p: 1,
                      boxShadow: 1,
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
                                color: theme.palette.primary.main,
                              },
                              "&:hover": {
                                backgroundColor: "rgba(233, 30, 99, 0.08)",
                              },
                            },
                            "& .MuiSwitch-track": {
                              backgroundColor: outsideGuidelines
                                ? theme.palette.primary.main
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
                                ? theme.palette.secondary.main
                                : "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: "bold",
                              color: outsideGuidelines
                                ? theme.palette.secondary.main
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

                  {/* AI Summary */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      Assistant Summary
                    </Typography>
                    {loadingSummary ? (
                      <Box display="flex" alignItems="center" mt={2}>
                        <CircularProgress size={20} />
                        <Typography sx={{ ml: 2 }}>
                          Summarizing notes...
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ mt: 2, whiteSpace: "pre-wrap" }}
                      >
                        {aiSummary}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={8}>
              <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="fullWidth"
                  >
                    <Tab label="Notes" value="1" />
                    <Tab label="Documents" value="2" />
                    <Tab label="Guidelines" value="3" />
                  </Tabs>
                </Box>

                {/* Tab Panels */}
                <TabPanel value="1">
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          backgroundColor: "#fff",
                          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #000",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                            backgroundColor: "#f5f5f5",
                            border: "1px solid #333",
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontWeight: "bold",
                            color: pink[500],
                            fontSize: "1.2rem",
                          }}
                        >
                          Treatment Cytostatic
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "1.5rem",
                            color: "#333",
                            lineHeight: "1.6",
                          }}
                        >
                          {consultationData["Treatement_Cytostatic"]}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Recommended Nr Of Sessions Card */}
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          backgroundColor: "#fff",
                          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #000",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                            backgroundColor: "#f5f5f5",
                            border: "1px solid #333",
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontWeight: "bold",
                            color: pink[500],
                            fontSize: "1.2rem",
                          }}
                        >
                          Recommended Nr Of Sessions
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "1.5rem",
                            color: "#333",
                            lineHeight: "1.6",
                          }}
                        >
                          {consultationData["Recommended_Nr_Of_Sessions"]}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Consultation Notes Card */}
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      mb: 2,
                      backgroundColor: "#fff",
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #000",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #333",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        color: pink[500],
                        fontSize: "1.2rem",
                      }}
                    >
                      Consultation Notes
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "1.5rem",
                        color: "#333",
                        lineHeight: "1.6",
                      }}
                    >
                      {consultationData.Notes || "No notes available."}
                    </Typography>
                  </Paper>
                </TabPanel>

                <TabPanel value="2">
                  <Grid container spacing={3}>
                    {/* Protocol Document */}
                    {consultationData.Protocol_Document && (
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                          <CardContent
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6" gutterBottom>
                              Protocol Document
                            </Typography>
                            <IconButton
                              sx={{ color: pink[500] }}
                              onClick={() =>
                                window.open(
                                  consultationData.Protocol_Document,
                                  "_blank",
                                )
                              }
                            >
                              <DownloadIcon />
                            </IconButton>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Report Document */}
                    {consultationData.Report_Document && (
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                          <CardContent
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6" gutterBottom>
                              Report Document
                            </Typography>
                            <IconButton
                              sx={{ color: pink[500] }}
                              onClick={() =>
                                window.open(
                                  consultationData.Report_Document,
                                  "_blank",
                                )
                              }
                            >
                              <DownloadIcon />
                            </IconButton>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Imaging Document */}
                    {consultationData.RMN_Document && (
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                          <CardContent
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6" gutterBottom>
                              Imaging (MRI / PET-CT / CT)
                            </Typography>
                            <IconButton
                              sx={{ color: pink[500] }}
                              onClick={() =>
                                window.open(
                                  consultationData.RMN_Document,
                                  "_blank",
                                )
                              }
                            >
                              <DownloadIcon />
                            </IconButton>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Blood Test Document */}
                    {consultationData.Blood_Document && (
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                          <CardContent
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6" gutterBottom>
                              Blood Test
                            </Typography>
                            <IconButton
                              sx={{ color: pink[500] }}
                              onClick={() =>
                                window.open(
                                  consultationData.Blood_Document,
                                  "_blank",
                                )
                              }
                            >
                              <DownloadIcon />
                            </IconButton>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value="3">
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                    <ESMOGuidelines
                      diagnostic={consultationData.Diagnostic}
                      ER={consultationData.ER}
                      PR={consultationData.PR}
                    />
                  </Paper>
                </TabPanel>
              </TabContext>
            </Grid>
          </Grid>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={() => setOpenSnackbar(false)}
          >
            <Alert severity="error">
              Please upload the required documents.
            </Alert>
          </Snackbar>
        </Container>
      </ThemeProvider>
    </MainLayout>
  );
};

export default LastInformation;
