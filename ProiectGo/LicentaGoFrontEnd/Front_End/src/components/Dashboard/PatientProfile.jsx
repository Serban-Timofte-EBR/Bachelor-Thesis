import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Grid,
  useTheme,
  styled,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CakeIcon from "@mui/icons-material/Cake";
import { TabPanel, a11yProps } from "../helpers/tabpanel";
import PatientInfoTab from "../Patient-profile/PatientInfo";
import NewConsultationTab from "../Patient-profile/NewConsultationTab";
import HistoryTab from "../Patient-profile/ConsultationHistory";

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  width: 56,
  height: 56,
  marginBottom: theme.spacing(2),
}));

const PatientProfile = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({
    report: null,
    rmn: null,
  });
  const [kpis, setKpis] = useState([
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
  ]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const patient = {
    name: "John Doe",
    birth: "1978-04-12",
    sex: "M",
    email: "john.doe@example.com",
  };

  const calculateAge = (birth) => {
    const today = new Date();
    const birthDate = new Date(birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ bgcolor: theme.palette.background.default, p: 2 }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <StyledAvatar>
                <AccountCircleIcon />
              </StyledAvatar>
              <Typography variant="h6" gutterBottom>
                {patient.name}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CakeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Born" secondary={patient.birth} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Age"
                    secondary={`${calculateAge(patient.birth)} years`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sex" secondary={patient.sex} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={patient.email} />
                </ListItem>
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="patient details tabs"
              variant="fullWidth"
            >
              <Tab label="Last Information" {...a11yProps(0)} />
              <Tab label="New Consultation" {...a11yProps(1)} />
              <Tab label="Consultations History" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel
            value={value}
            index={0}
            sx={{ bgcolor: theme.palette.background.default }}
          >
            <PatientInfoTab kpis={kpis} />
          </TabPanel>
          <TabPanel
            value={value}
            index={1}
            sx={{ bgcolor: theme.palette.background.default }}
          >
            <NewConsultationTab
              kpis={kpis}
              setKpis={setKpis}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
          </TabPanel>
          <TabPanel
            value={value}
            index={2}
            sx={{ bgcolor: theme.palette.background.default }}
          >
            <HistoryTab />
          </TabPanel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientProfile;
