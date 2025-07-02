import React from 'react';
import { Typography, Box, List } from '@mui/material';
import ConsultationRoadmapItem from './ConsultationRoadmapItem';

const ConsultationsHistoryTab = () => {
  const consultations = [
    { id: 1, name: 'Consultation 1', date: '2024-06-01', patient: 'John Doe' },
    { id: 2, name: 'Consultation 2', date: '2024-06-10', patient: 'Jane Smith' },
    { id: 3, name: 'Consultation 3', date: '2024-06-20', patient: 'Jack Johnson' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Consultations History
      </Typography>
      <List>
        {consultations.map((consultation) => (
          <ConsultationRoadmapItem key={consultation.id} consultation={consultation} />
        ))}
      </List>
    </Box>
  );
};

export default ConsultationsHistoryTab;
