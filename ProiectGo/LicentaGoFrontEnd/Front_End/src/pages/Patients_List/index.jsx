import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
  Divider,
  TextField,
  CircularProgress,
  Box,
  Fab,
  Modal,
  Alert,
} from "@mui/material";
import MainLayout from "../../layout/MainLayout";
import PatientRow from "../../components/Patient-profile/PatientRow";
import PatientForm from "../../components/Patient-profile/PatientForm";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatientsOfDoctor,
  createPatient,
} from "../../redux/slices/patientsSlice";
import {
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  People as PeopleIcon,
  PersonOff as PersonOffIcon,
  Replay as ReplayIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const PatientsList = () => {
  const dispatch = useDispatch();
  const {
    patients = [],
    loading,
    error,
  } = useSelector((state) => state.patients);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentDateTime] = useState(new Date());

  const currentDate = currentDateTime.toLocaleDateString();
  const currentTime = currentDateTime.toLocaleTimeString();

  // Fetch patients on component mount
  useEffect(() => {
    dispatch(fetchPatientsOfDoctor());
  }, [dispatch]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter patients by search term
  const filteredPatients = patients.filter((patientWrapper) => {
    const patient = patientWrapper?.patient;
    const fullName =
        `${patient?.person?.f_name || ""} ${patient?.person?.l_name || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const totalPatients = patients.length;

  // Calculate inactive patients (6+ months)
  const inactivePatients = filteredPatients.filter((patientWrapper) => {
    const patient = patientWrapper?.patient;
    const lastConsultDate =
        patient?.consults?.[patient.consults.length - 1]?.date;
    if (!lastConsultDate) return false;
    return (
        new Date(lastConsultDate) < new Date().setMonth(new Date().getMonth() - 6)
    );
  }).length;

  // Calculate patients that need follow-up
  const followUpNeeded = filteredPatients.filter((patientWrapper) => {
    const patient = patientWrapper?.patient;
    return patient?.consults?.some((consult) =>
        consult?.details?.toLowerCase().includes("follow-up")
    );
  }).length;

  // Handle patient creation
  const handleCreatePatient = (patientData) => {
    dispatch(createPatient(patientData))
        .unwrap()
        .then(() => {
          dispatch(fetchPatientsOfDoctor());
          setSubmitError(null);
        })
        .catch((error) => {
          setSubmitError(error || "Failed to create patient.");
        })
        .finally(() => {
          setIsModalOpen(false);
        })
  };

  if (loading) {
    return (
        <MainLayout>
          <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "50px",
              }}
          >
            <CircularProgress />
          </div>
        </MainLayout>
    );
  }

  return (
      <MainLayout>
        <Grid container spacing={3} sx={{ padding: 3 }}>
          {/* Table Section on the Left */}
          <Grid item xs={12} md={9}>
            <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
            >
              <Typography variant="h5">Patients List</Typography>
              <TextField
                  variant="outlined"
                  label="Search Patient"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size="small"
                  sx={{ width: 250 }}
              />
            </Box>
            {/* Global error display */}
            {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
            )}
            <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: 3, backgroundColor: "#fff" }}>
              <TableContainer sx={{ maxHeight: "500px", overflow: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>CNP</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPatients.map((patientWrapper, index) => {
                      const patient = patientWrapper?.patient;
                      return (
                          <PatientRow
                              key={patient?.id_patient || index}
                              patient={patient}
                              rowStyle={{
                                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                                "&:hover": { backgroundColor: "#e0f7fa" },
                              }}
                              setSubmitError={setSubmitError} // Pass setSubmitError down
                          />
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Stats Section on the Right */}
          <Grid
              item
              xs={12}
              md={3}
              sx={{ backgroundSize: "cover", backgroundRepeat: "no-repeat" }}
          >
            <Box
                sx={{ padding: 2, marginBottom: 3, backgroundColor: "transparent" }}
            >
              <Typography
                  variant="h6"
                  sx={{ color: "#333", fontWeight: "bold", fontSize: "0.9rem" }}
              >
                Total Patients
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon color="primary" />
                <Typography
                    variant="h4"
                    sx={{ color: "#e91e63", fontSize: "1.5rem" }}
                >
                  {totalPatients}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box
                sx={{ padding: 2, marginBottom: 3, backgroundColor: "transparent" }}
            >
              <Typography
                  variant="h6"
                  sx={{ color: "#333", fontWeight: "bold", fontSize: "0.9rem" }}
              >
                Inactive Patients (6+ months)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonOffIcon color="error" />
                <Typography
                    variant="h4"
                    sx={{ color: "#e91e63", fontSize: "1.5rem" }}
                >
                  {inactivePatients}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box
                sx={{ padding: 2, marginBottom: 3, backgroundColor: "transparent" }}
            >
              <Typography
                  variant="h6"
                  sx={{ color: "#333", fontWeight: "bold", fontSize: "0.9rem" }}
              >
                Follow-up Needed
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ReplayIcon color="secondary" />
                <Typography
                    variant="h4"
                    sx={{ color: "#e91e63", fontSize: "1.5rem" }}
                >
                  {followUpNeeded}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box
                sx={{ padding: 2, marginBottom: 3, backgroundColor: "transparent" }}
            >
              <Typography
                  variant="h6"
                  sx={{ color: "#333", fontWeight: "bold", fontSize: "0.9rem" }}
              >
                Date
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EventIcon color="primary" />
                <Typography
                    variant="h4"
                    sx={{ color: "#e91e63", fontSize: "1.5rem" }}
                >
                  {currentDate}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box
                sx={{ padding: 2, marginBottom: 3, backgroundColor: "transparent" }}
            >
              <Typography
                  variant="h6"
                  sx={{ color: "#333", fontWeight: "bold", fontSize: "0.9rem" }}
              >
                Current Time
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon color="primary" />
                <Typography
                    variant="h4"
                    sx={{ color: "#e91e63", fontSize: "1.5rem" }}
                >
                  {currentTime}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Floating Action Button to Add New Patient */}
        <Fab
            color="primary"
            aria-label="add"
            sx={{ position: "fixed", bottom: 16, left: 16 }}
            onClick={() => setIsModalOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Modal for New Patient Form */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
              }}
          >
            {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
            )}
            <PatientForm
                onSubmit={handleCreatePatient}
                onCancel={() => setIsModalOpen(false)}
            />
          </Box>
        </Modal>
      </MainLayout>
  );
};

export default PatientsList;