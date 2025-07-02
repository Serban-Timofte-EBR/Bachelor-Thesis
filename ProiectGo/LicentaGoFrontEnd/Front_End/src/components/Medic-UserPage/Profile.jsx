import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ProfileField from "./ProfileField";
import EditProfileModal from "./EditProfileModal";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
} from "../../redux/slices/doctorSlice";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.doctor);

  const [open, setOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctorProfile());
  }, [dispatch]);

  useEffect(() => {
    setEditProfile(profile);
  }, [profile]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProfile({
      ...editProfile,
      [name]: value,
    });
  };

  const handleSave = (payload) => {
    dispatch(updateDoctorProfile(payload))
      .unwrap()
      .then(() => {
        setSuccessMessage("Profile updated successfully!");
        dispatch(fetchDoctorProfile());
        handleClose();
      })
      .catch((error) => {
        setErrorMessage(error?.message || "Error updating profile");
      });
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

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

  if (error) {
    return (
      <Typography variant="h6" color="error">
        Error: {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(to right, #fff, #f9f9f9)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Avatar sx={{ bgcolor: "#e91e63", width: 56, height: 56, mr: 2 }}>
            {profile?.person?.f_name?.charAt(0) || "D"}
          </Avatar>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Doctor Profile
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleOpen}
            sx={{
              borderColor: "#e91e63",
              color: "#e91e63",
              "&:hover": { backgroundColor: "#fce4ec" },
            }}
          >
            Edit Profile
          </Button>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ProfileField
              label="First Name"
              value={profile?.person?.f_name || "-"}
            />
            <ProfileField
              label="Last Name"
              value={profile?.person?.l_name || "-"}
            />

            <ProfileField
              label="ID Doctor (Cod Parafa)"
              value={profile?.parafa || "-"}
            />
            <ProfileField label="CNP" value={profile?.person?.cnp || "-"} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ProfileField
              label="Email"
              value={profile?.person?.virtual_address?.email || "-"}
            />
            <ProfileField
              label="Phone Number"
              value={profile?.person?.virtual_address?.phone_number || "-"}
            />
            <ProfileField
              label="County"
              value={profile?.person?.address?.loc?.jud?.name || "-"}
            />
            <ProfileField
              label="Locality"
              value={profile?.person?.address?.loc?.name || "-"}
            />
          </Grid>
        </Grid>
        <EditProfileModal
          open={open}
          handleClose={handleClose}
          profile={editProfile}
          handleChange={handleChange}
          handleSave={handleSave}
        />
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
