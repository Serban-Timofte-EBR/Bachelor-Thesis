import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 120,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
});

const StatisticsCard = ({ title, value, icon }) => {
  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default StatisticsCard;
