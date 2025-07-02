import React from "react";
import { Typography, Box } from "@mui/material";

const ProfileField = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="body1">{value || "-"}</Typography>
  </Box>
);

export default ProfileField;
