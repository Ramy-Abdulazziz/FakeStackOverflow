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
import QuestionContext from "./questionContext";

export default function MenuDrawer({ open, setOpen }) {
  const [userName, setUserName] = useState("");
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserStatus = async () => {
      if (authContext.isLoggedIn && authContext.userRole !== "guest") {
        setUserName(authContext.userName);
      }
    };

    getUserStatus();
  }, [authContext]);

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

  const handleAllQuestions = async () => {
    try {
      questionContext.fetchAll();
    } catch (err) {
      console.error(err);
    }finally{

      navigate('/home')
    }
  };

  const navigateUserProfile = async () => {

    const userId = authContext.userId;
    navigate(`/user/${userId}`)
  }

  const userOptions = () => (
    <List>
      <ListItem disablePadding>
        <ListItemButton onClick={navigateUserProfile}>
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
          <ListItemButton onClick={handleAllQuestions}>
            <ListItemIcon>
              <LiveHelpIcon />
            </ListItemIcon>
            <ListItemText primary={"All Questions"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/all-tags")}>
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
