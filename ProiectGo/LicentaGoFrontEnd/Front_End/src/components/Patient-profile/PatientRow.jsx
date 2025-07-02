import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Button,
  Modal,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  Delete,
  Edit,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deletePatient, updatePatient, fetchPatientsOfDoctor } from "../../redux/slices/patientsSlice";
import PatientFormUpdate from "./PatientFormUpdate";

const PatientRow = ({ patient, rowStyle, setSubmitError }) => {
  const [open, setOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New state for delete confirmation dialog
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleView = () => {
    navigate(`/patients/${patient.id_patient}`);
  };

  const handleDelete = () => {
    dispatch(deletePatient(patient.id_patient))
        .unwrap()
        .then(() => {
          dispatch(fetchPatientsOfDoctor());
          setSubmitError(null);
        })
        .catch((error) => {
          setSubmitError(error || "Failed to delete patient.");
        })
        .finally(() => {
          setIsDeleteDialogOpen(false);
        });
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSubmitError(null);
  };

  const handleUpdateSubmit = (updatedData) => {
    dispatch(updatePatient({ id: patient.id_patient, data: updatedData }))
        .unwrap()
        .then(() => {
          dispatch(fetchPatientsOfDoctor());
          setSubmitError(null);
        })
        .catch((error) => {
          const errorMessage = typeof error === "string" ? error : error?.error?.message || "Failed to update patient.";
          setSubmitError(errorMessage);
        })
        .finally(() => {
          setIsUpdateModalOpen(false);
        });
  };

  const firstName = patient.person.f_name;
  const lastName = patient.person.l_name;
  const phone = patient.person.virtual_address.phone_number;
  const cnp = patient.person.cnp;
  const bornDate = patient.person.born_date;

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

  const age = calculateAge(bornDate);

  return (
      <>
        <TableRow sx={rowStyle}>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{patient.person.f_name}</TableCell>
          <TableCell>{patient.person.l_name}</TableCell>
          <TableCell>{patient.person.virtual_address.phone_number}</TableCell>
          <TableCell>{patient.person.cnp}</TableCell>
          <TableCell>{age}</TableCell>
          <TableCell>
            <Button size="small" color="primary" onClick={handleView}>
              <Visibility />
            </Button>
            <Button size="small" color="secondary" onClick={() => setIsDeleteDialogOpen(true)} sx={{ ml: 1 }}>
              <Delete />
            </Button>
            <Button size="small" color="primary" onClick={() => setIsUpdateModalOpen(true)} sx={{ ml: 1 }}>
              <Edit />
            </Button>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Typography variant="h6" gutterBottom component="div">
                  Additional Details
                </Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>

        {/* Update Patient Modal */}
        <Modal open={isUpdateModalOpen} onClose={handleCloseUpdateModal}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, bgcolor: "background.paper", borderRadius: 3, boxShadow: 24, p: 4 }}>
            <PatientFormUpdate onSubmit={handleUpdateSubmit} onCancel={handleCloseUpdateModal} initialValues={patient.person} />
          </Box>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogTitle>Delete Patient</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this patient? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
};

export default PatientRow;