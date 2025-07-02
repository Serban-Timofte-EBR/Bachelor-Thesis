import React, { useState } from 'react';
import { Typography, Button, Box, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const MedicalReports = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Protocol raportare carcinom mamar invaziv
      </Typography>
      <Button
        startIcon={<UploadFileIcon />}
        variant="contained"
        component="label"
        sx={{ mb: 2 }}
      >
        Upload Document
        <input
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {selectedFile && (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Preview:
          </Typography>
          <Box component="iframe" src={selectedFile} sx={{ width: '100%', height: 300 }} />
        </Paper>
      )}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle1">Extracted Values:</Typography>
        <Typography>ER: Positive</Typography>
        <Typography>PR: Negative</Typography>
        <Typography>HER2: Positive</Typography>
        <Typography>KI67: High</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>Diagnosis:</Typography>
        <Typography>Luminal A</Typography>
      </Paper>
    </Box>
  );
};

export default MedicalReports;