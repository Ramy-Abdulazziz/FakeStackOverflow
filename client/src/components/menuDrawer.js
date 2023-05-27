import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import StyleIcon from "@mui/icons-material/Style";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Divider } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AuthContext from "./authContext";
import { useNavigate } from "react-router";

export default function MenuDrawer({ open, setOpen }) {
  const [userName, setUserName] = useState("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserStatus = async () => {
      if (authContext.isLoggedIn && authContext.userRole !== "guest") {
        console.log(authContext);
        setUserName(authContext.userName);
      }
    };

    getUserStatus();
  }, []);


  const handleLogout = async () => {
    try {
      await authContext.onLogout();

      navigate("/");
    } catch (err) {
      console.error("Logout failed");
    }
  };
  const drawerState = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const userOptions = () => (
    <List>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary={userName} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={"Log out"} />
        </ListItemButton>
      </ListItem>
    </List>
  );

  const guestOptions = () => (
    <List>
      <ListItem disablePadding>
        <ListItemButton onClick={() => navigate("/sign-up")}>
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary={"Sign Up"} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={() => navigate("/")}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={"Log In"} />
        </ListItemButton>
      </ListItem>
    </List>
  );

  const list = () => (
    <Box
      sx={{ width: "auto" }}
      role="presentation"
      onClick={drawerState}
      onKeyDown={drawerState}
    >
      <List>
        {authContext.userRole === "user" ? userOptions() : guestOptions()}
        <Divider />
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <LiveHelpIcon />
            </ListItemIcon>
            <ListItemText primary={"All Questions"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <StyleIcon />
            </ListItemIcon>
            <ListItemText primary={"All Tags"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer anchor="left" open={open}>
      {list()}
    </Drawer>
  );
}
