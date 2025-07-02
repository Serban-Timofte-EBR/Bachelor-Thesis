import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const formatDate = (date) => {
  const diff = new Date() - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days} days ago`;
};

const ConsultDetails = ({ consults }) => {
  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table size="small" aria-label="consults table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Time Passed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {consults.map((consult, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(consult.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{consult.details}</TableCell>
              <TableCell>{formatDate(consult.date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ConsultDetails;
