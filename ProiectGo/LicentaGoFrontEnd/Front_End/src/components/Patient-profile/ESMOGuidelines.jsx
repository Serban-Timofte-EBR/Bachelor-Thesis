import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e91e63",
    },
  },
  typography: {
    h5: {
      fontWeight: "bold",
    },
  },
});

const ESMOGuidelines = ({ diagnostic, ER, PR }) => {
  const [guidelines, setGuidelines] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/guidelines?diagnostic=${encodeURIComponent(
            diagnostic
          )}&ER=${ER}&PR=${PR}`
        );
        if (!response.ok) {
          throw new Error(`Error fetching guidelines: ${response.statusText}`);
        }
        const data = await response.json();
        setGuidelines(data.esmo_guidelines);
      } catch (error) {
        console.error(error);
        setFetchError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelines();
  }, [diagnostic, ER, PR]);

  if (loading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Loading ESMO Guidelines...
        </Typography>
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box mt={4} textAlign="center">
        <Typography color="error">
          Failed to load guidelines: {fetchError}
        </Typography>
      </Box>
    );
  }

  if (!guidelines) {
    return (
      <Box mt={4} textAlign="center">
        <Typography>No guidelines found for this diagnostic.</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom color="primary">
          ESMO Guidelines for {diagnostic}
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: "bold" }}>
              {guidelines.firstLineTreatment.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {guidelines.firstLineTreatment.items.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.titleItem}
                      secondary={
                        <>
                          <Typography variant="body2">
                            {item.indication}
                          </Typography>
                          {item.alternativeIndication && (
                            <Typography variant="body2">
                              <strong>Alternative:</strong>{" "}
                              {item.alternativeIndication}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index <
                    guidelines.firstLineTreatment.items.length - 1 && (
                    <Divider />
                  )}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: "bold" }}>
              {guidelines.diseaseProgression.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {guidelines.diseaseProgression.items.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.titleItem}
                      secondary={
                        <>
                          <Typography variant="body2">
                            {item.indication}
                          </Typography>
                          {item.alternativeIndication && (
                            <Typography variant="body2">
                              <strong>Alternative:</strong>{" "}
                              {item.alternativeIndication}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index <
                    guidelines.diseaseProgression.items.length - 1 && (
                    <Divider />
                  )}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    </ThemeProvider>
  );
};

export default ESMOGuidelines;