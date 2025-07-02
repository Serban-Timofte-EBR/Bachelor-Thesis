import React, { useState } from 'react';
import {
  Typography,
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Avatar,
  IconButton,
  styled,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import ReportIcon from '@mui/icons-material/Report';
import { green } from '@mui/material/colors';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

const ConsultationRoadmapItem = ({ consultation }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <StyledListItem>
      <ListItemIcon>
        <Avatar sx={{ bgcolor: green[500] }}>
          <ReportIcon />
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={consultation.name}
        secondary={`Date: ${consultation.date}, Patient: ${consultation.patient}`}
      />
      <IconButton onClick={handleExpandClick}>
        <ExpandMoreIcon />
      </IconButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Consultation Details</Typography>
          <Typography paragraph>
            Insert consultation details here. KPIs and MRI report will be shown.
          </Typography>
        </Box>
      </Collapse>
    </StyledListItem>
  );
};

export default ConsultationRoadmapItem;
