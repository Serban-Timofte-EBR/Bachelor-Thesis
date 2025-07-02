import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); 
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid confirmation link.");
      return;
    }

    axios
      .get(`http://localhost:8082/confirm?token=${token}`)
      .then((response) => {
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage("An error occurred during email confirmation.");
        }
      });
  }, [token]);

  if (status === "loading") {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {status === "success" ? (
        <>
          <Typography variant="h4" gutterBottom>
            Email Confirmed Successfully!
          </Typography>
          <Typography variant="body1">
            Your account has been activated. You can now log in.
          </Typography>
        </>
      ) : (
        <Alert severity="error">
          <Typography variant="h6">Confirmation Failed</Typography>
          <Typography variant="body1">{errorMessage}</Typography>
        </Alert>
      )}
    </Box>
  );
};

export default EmailConfirmation;
