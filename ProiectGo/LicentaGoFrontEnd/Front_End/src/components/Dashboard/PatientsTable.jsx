import React from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Fab, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PatientsTable = () => {
  const patients = [
    { id: 1, name: 'John', surname: 'Doe', dateOfBirth: '1990-01-01', sex: 'M', diagnosis: 'Luminal A' },
    { id: 2, name: 'John', surname: 'Doe', dateOfBirth: '1990-01-01', sex: 'M', diagnosis: 'Luminal A' },
    { id: 3, name: 'John', surname: 'Doe', dateOfBirth: '1990-01-01', sex: 'M', diagnosis: 'Luminal A' },
    { id: 4, name: 'John', surname: 'Doe', dateOfBirth: '1990-01-01', sex: 'M', diagnosis: 'Luminal A' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table aria-label="patients table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Surname</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Sex</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.surname}</TableCell>
                <TableCell>{patient.dateOfBirth}</TableCell>
                <TableCell>{patient.sex}</TableCell>
                <TableCell>{patient.diagnosis}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" aria-label="view patient">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="edit patient">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" aria-label="delete patient">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Fab color="primary" aria-label="add patient" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default PatientsTable;