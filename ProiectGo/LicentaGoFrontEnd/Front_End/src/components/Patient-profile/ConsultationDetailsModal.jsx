import React from "react";
import {
  Box,
  Typography,
  Modal,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";

const ConsultationDetailsModal = ({ open, onClose, consult }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 800,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: "auto",
          maxHeight: "90vh",
          outline: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            {consult?.subtitle}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#e91e63" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography id="modal-description" sx={{ mt: 2 }}>
          {consult?.details}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          KPIs
        </Typography>
        <Grid container spacing={2}>
          {consult?.kpis.map((kpi, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Typography variant="body1">
                <strong>{kpi.label}:</strong> {kpi.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
          Notes
        </Typography>
        <Typography sx={{ mb: 2 }}>{consult?.notes}</Typography>
        {consult?.protocol && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Protocol
              </Typography>
              <IconButton
                color="primary"
                onClick={() => window.open(consult.protocol, "_blank")}
              >
                <VisibilityIcon />
              </IconButton>
            </Box>
            <Card sx={{ height: 'auto', width: '100%', mb: 3 }}>
              <CardContent sx={{ padding: 0 }}>
                <CardMedia
                  component="iframe"
                  src={consult.protocol}
                  title="Protocol File"
                  sx={{ height: "100%", width: "100%" }}
                />
              </CardContent>
            </Card>
          </>
        )}

        <Divider sx={{ my: 3 }} />
        <Box display="flex" alignItems="center">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            RMN
          </Typography>
          <IconButton
            color="primary"
            onClick={() => window.open(consult.rmn, "_blank")}
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
        <Card sx={{ height: 'auto', width: '100%', mb: 3 }}>
          <CardContent sx={{ padding: 0 }}>
            <CardMedia
              component="iframe"
              src={consult?.rmn}
              title="RMN File"
              sx={{ height: "100%", width: "100%" }}
            />
          </CardContent>
        </Card>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Report
          </Typography>
          <IconButton
            color="primary"
            onClick={() => window.open(consult.report, "_blank")}
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
        <Card sx={{ height: 'auto', width: '100%', mb: 3 }}>
          <CardContent sx={{ padding: 0 }}>
            <CardMedia
              component="iframe"
              src={consult?.report}
              title="Report File"
              sx={{ height: "100%", width: "100%" }}
            />
          </CardContent>
        </Card>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{ display: "block", margin: "0 auto", mt: 2 }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ConsultationDetailsModal;
