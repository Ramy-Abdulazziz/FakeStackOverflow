import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import StyleIcon from "@mui/icons-material/Style";

export default function MenuDrawer({ open, setOpen }) {
  const drawerState = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const list = () => (
    <Box
      sx={{ width: "auto" }}
      role="presentation"
      onClick={drawerState}
      onKeyDown={drawerState}
    >
      <List>
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
