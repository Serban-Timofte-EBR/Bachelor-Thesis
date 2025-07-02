import React from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress color="primary" />
      <Typography sx={{ mt: 2 }}>{message}</Typography>
    </Box>
  );
};

export default LoadingSpinner; 