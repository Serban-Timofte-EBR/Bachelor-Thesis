import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SendIcon from "@mui/icons-material/Send";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme";
import eOncoHub from "../../assets/images/eOncoHub.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, isLoading } = useAuth();

  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
  };

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 250 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "primary.main",
          color: "white",
          height: "64px",
          paddingTop: "15px",
          paddingBottom: "10px",
        }}
      >
        <Grid container>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
              }}
            >
              Enhanced OncoHub
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <List>
        <ListItem>
          <img
            src={eOncoHub}
            alt="eOncoHub"
            style={{ width: "65%", margin: "0 auto" }}
          />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => handleNavigation("/patients")}
          sx={{ "&:hover": { backgroundColor: "#f8bbd0" } }}
        >
          <ListItemIcon>
            <PeopleIcon sx={{ color: "#e91e63" }} />
          </ListItemIcon>
          <ListItemText primary="Patient List" />
        </ListItem>
        <ListItem
          button
          onClick={() => handleNavigation("/medical-profile")}
          sx={{ "&:hover": { backgroundColor: "#f8bbd0" } }}
        >
          <ListItemIcon>
            <PersonIcon sx={{ color: "#e91e63" }} />
          </ListItemIcon>
          <ListItemText primary="Med Profile" />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={handleLogout}
          sx={{ "&:hover": { backgroundColor: "#f8bbd0" } }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: "#e91e63" }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
          {isLoading && <CircularProgress size={20} sx={{ marginLeft: 2 }} />}
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" sx={{ backgroundColor: "#e91e63" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            e-OncoHub
          </Typography>
          <IconButton color="inherit" aria-label="send message">
            <SendIcon />
          </IconButton>
          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
            {list()}
          </Drawer>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
