import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Box,
  Grid,
  CircularProgress,
  Divider,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import MainLayout from "../../layout/MainLayout";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllConsultations } from "../../redux/slices/consultationSlice";
import { useParams } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: pink[500], // Breast cancer pink color
    },
    secondary: {
      main: grey[700], // Sleek grey for secondary actions
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    button: {
      textTransform: "none",
      fontSize: "1rem",
    },
  },
});

const ConsultationHistory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { consultations, loading, errorMessage } = useSelector(
    (state) => state.consultations,
  );
  const [open, setOpen] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState(null);

  useEffect(() => {
    dispatch(fetchAllConsultations(id));
  }, [dispatch, id]);

  const handleOpen = (consult) => {
    setSelectedConsult(consult);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedConsult(null);
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
      </Container>
    );
  }

  if (errorMessage || !consultations || consultations.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          textAlign: "center",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          maxWidth: "600px",
          margin: "auto",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "#e91e63",
            fontWeight: "bold",
            marginBottom: "16px",
            fontSize: "2rem",
          }}
        >
          No Consultation Data Found
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            marginBottom: "24px",
            fontSize: "1.2rem",
            color: "#6c757d",
          }}
        >
          Unfortunately, we couldn't locate any consultation records for this
          patient. Please verify the data or try again later.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: "#e91e63",
            color: "#fff",
            padding: "10px 20px",
            fontSize: "1rem",
            textTransform: "none",
            borderRadius: "8px",
            ":hover": {
              backgroundColor: "#d81b60",
            },
          }}
          onClick={() => {
            window.history.back();
          }}
        >
          Go Back to Patient List
        </Button>
      </Box>
    );
  }

  return (
    <MainLayout>
      <ThemeProvider theme={theme}>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
            Patient Consultations History
          </Typography>
          {consultations.length > 0 ? (
            <Timeline position="alternate">
              {consultations.map((consult, index) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent
                    sx={{ m: "auto 0", color: grey[600] }}
                    align={index % 2 === 0 ? "right" : "left"}
                    variant="body2"
                  >
                    {new Date(consult.Appointment_Date).toLocaleDateString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    {index !== 0 && <TimelineConnector />}
                    <TimelineDot color="primary">
                      <EventNoteIcon />
                    </TimelineDot>
                    {index !== consultations.length - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: "12px", px: 2 }}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        cursor: "pointer",
                        borderRadius: "8px",
                        "&:hover": {
                          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                      onClick={() => handleOpen(consult)}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: theme.palette.primary.main, mb: 1 }}
                      >
                        Consultation {consultations.length - index}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: grey[800], fontWeight: "bold" }}
                      >
                        {consult.Diagnostic}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h4"
                sx={{ color: "#e91e63", fontWeight: "bold", mb: 2 }}
              >
                No Consultation Data Found
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mb: 2, fontSize: "1.2rem" }}
              >
                We couldn't find any consultation data for this patient. Please
                verify the data or try again later.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.history.back()}
                sx={{
                  backgroundColor: "#e91e63",
                  color: "#fff",
                  fontSize: "1rem",
                  padding: "10px 20px",
                  borderRadius: "8px",
                }}
              >
                Go Back to Patient List
              </Button>
            </Box>
          )}

          {/* Consultation Details Modal */}
          {selectedConsult && (
            <Dialog
              open={open}
              onClose={handleClose}
              maxWidth="md"
              fullWidth
              scroll="paper"
            >
              <DialogTitle
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}
              >
                Consultation Details
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ px: 4, py: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: theme.palette.primary.main }}
                >
                  Date:{" "}
                  {new Date(
                    selectedConsult.Appointment_Date,
                  ).toLocaleDateString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: theme.palette.primary.main }}
                >
                  Diagnostic: {selectedConsult.Diagnostic}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Notes:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedConsult.Notes}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
                  KPIs:
                </Typography>
                <List dense>
                  {[
                    { label: "ER", value: selectedConsult.ER },
                    { label: "PR", value: selectedConsult.PR },
                    { label: "HER2", value: selectedConsult.HER2 },
                    { label: "Ki67", value: selectedConsult.Ki67 },
                    { label: "TNM", value: selectedConsult.TNM },
                    {
                      label: "Histologic Type",
                      value: selectedConsult["Histologic Type"],
                    },
                    {
                      label: "Histologic Grade",
                      value: selectedConsult["Histologic Grade"],
                    },
                    {
                      label: "Carcinoma in situ",
                      value: selectedConsult["Carcinoma in situ"],
                    },
                    {
                      label: "Nuclear Histologic Grade",
                      value: selectedConsult["Nuclear Histologic Grade"],
                    },
                    { label: "Stage", value: selectedConsult.Stage },
                    {
                      label: "SLT Organ Failure",
                      value: selectedConsult.SLT_Organ_Failure
                        ? "True"
                        : "False",
                    },
                  ].map((kpi, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{kpi.label}:</strong> {kpi.value}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Documents:
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Protocol Document",
                      link: selectedConsult.Protocol_Document,
                    },
                    {
                      label: "Report Document",
                      link: selectedConsult.Report_Document,
                    },
                    {
                      label: "Imaging Document",
                      link: selectedConsult.RMN_Document,
                    },
                    {
                      label: "Blood Test",
                      link: selectedConsult.Blood_Document,
                    },
                  ]
                    .filter((doc) => doc.link)
                    .map((doc, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            "&:hover": {
                              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                            },
                          }}
                        >
                          <CardContent
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6">{doc.label}</Typography>
                            <IconButton
                              color="primary"
                              onClick={() => window.open(doc.link, "_blank")}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={handleClose}
                  variant="contained"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </Container>
      </ThemeProvider>
    </MainLayout>
  );
};

export default ConsultationHistory;
