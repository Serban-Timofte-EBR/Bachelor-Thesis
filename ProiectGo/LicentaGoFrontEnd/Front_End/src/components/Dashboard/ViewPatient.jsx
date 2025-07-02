import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  Wc as WcIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
  Fingerprint as FingerprintIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  NoteAdd as NoteAddIcon,
} from "@mui/icons-material";
import { pink } from "@mui/material/colors";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPatient } from "../../redux/slices/patientsSlice";

const PatientProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { patient, loading, error } = useSelector((state) => state.patients);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getPatient(id));
  }, [dispatch, id]);

  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (loading) {
    return (
      <Typography>Loading...</Typography>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!patient) {
    return (
      <Typography>No patient found</Typography>
    );
  }

  const { person } = patient;
  const fullName = `${person.f_name} ${person.l_name}`;
  const age = calculateAge(person.born_date);
  const gender = person.sex === "M" ? "Male" : "Female";
  const address = person.address.address;
  const city = person.address.loc.name;
  const county = person.address.loc.jud.name;
  const email = person.virtual_address.email;
  const phone = person.virtual_address.phone_number;
  const dateOfBirth = new Date(person.born_date).toLocaleDateString();
  const cnp = person.cnp;

  const cardItems = [
    {
      title: "Last Information",
      description: "View the latest consultation details",
      icon: <InfoIcon sx={{ fontSize: 50, color: pink[500] }} />,
      link: `/patients/${id}/last-information`, 
    },
    {
      title: "New Consultation",
      description: "Add a new consultation for the patient",
      icon: <NoteAddIcon sx={{ fontSize: 50, color: pink[500] }} />,
      link: `/patients/${id}/new-consultation`,
    },
    {
      title: "Consultation History",
      description: "Review past consultations",
      icon: <HistoryIcon sx={{ fontSize: 50, color: pink[500] }} />,
      link: `/patients/${id}/consultation-history`,
    },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: 3,
          overflow: "visible",
        }}
      >
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: pink[500],
                  }}
                >
                  <AccountCircleIcon sx={{ fontSize: 100 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {fullName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Patient ID: {patient.id_patient}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FingerprintIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>CNP</Typography>}
                    secondary={cnp}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CakeIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Date of Birth</Typography>}
                    secondary={dateOfBirth}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <WcIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Gender</Typography>}
                    secondary={gender}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <AccountCircleIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Age</Typography>}
                    secondary={`${age} years`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Phone Number</Typography>}
                    secondary={phone}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Email</Typography>}
                    secondary={email}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <HomeIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Address</Typography>}
                    secondary={address}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <LocationCityIcon sx = {{color: pink[500]}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>City / County</Typography>}
                    secondary={`${city}, ${county}`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {cardItems.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  cursor: "pointer",
                }}
                onClick={() => navigate(item.link)}
              >
                <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                  {item.icon}
                  <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, textAlign: "center" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: "center" }}>
                    {item.description}
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PatientProfile;  