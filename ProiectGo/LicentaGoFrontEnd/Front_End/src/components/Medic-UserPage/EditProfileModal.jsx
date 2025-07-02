import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, TextField, Button, Grid } from "@mui/material";

const EditProfileModal = ({ open, handleClose, profile, handleSave }) => {
  const [formValues, setFormValues] = useState({
    f_name: "",
    l_name: "",
    parafa: "",
    county: "",
    locality: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    if (profile) {
      setFormValues({
        f_name: profile?.person?.f_name || "",
        l_name: profile?.person?.l_name || "",
        parafa: profile?.parafa || "",
        county: profile?.person?.address?.loc?.jud?.name || "",
        locality: profile?.person?.address?.loc?.name || "",
        email: profile?.person?.virtual_address?.email || "",
        phone_number: profile?.person?.virtual_address?.phone_number || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to ${value}`);
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveClick = () => {
    const payload = {
      Person: {
        f_name: formValues.f_name,
        l_name: formValues.l_name,
        virtual_address: {
          email: formValues.email,
          phone_number: formValues.phone_number,
        },
        address: {
          loc: {
            jud: {
              name: formValues.county,
            },
            name: formValues.locality,
          },
        },
      },
      parafa: formValues.parafa,
    };

    handleSave(payload);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-profile-modal"
      aria-describedby="edit-profile-modal-description"
    >
      <Box sx={style}>
        <Typography
          id="edit-profile-modal-title"
          variant="h4"
          component="h2"
          sx={{ mb: 2 }}
        >
          Edit Profile
        </Typography>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="f_name"
                value={formValues.f_name}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="l_name"
                value={formValues.l_name}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="ID Doctor (Cod Parafa)"
                name="parafa"
                value={formValues.parafa}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="County"
                name="county"
                value={formValues.county}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Locality"
                name="locality"
                value={formValues.locality}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formValues.phone_number}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveClick}
            sx={{ mt: 2, backgroundColor: "#e91e63" }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: "800px",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

export default EditProfileModal;
