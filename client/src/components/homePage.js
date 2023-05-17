import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import { useState, useContext, useEffect } from "react";
import { Link } from "@mui/material";
import MenuDrawer from "./menuDrawer";
import AuthContext from "./authContext";
import QuestionDisplay from "./questionDisplay";
import Paper from "@mui/material/Paper";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import axios from "axios";

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));
function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const authContext = useContext(AuthContext);

  const toggleMenu = (event) => {
    if (menuOpen) {
      setMenuOpen(false);
    } else if (menuOpen && event.type === "mousedown") {
      setMenuOpen(false);
    } else {
      setMenuOpen(true);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            FakeStackOverflow
          </Typography>

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
          <Button href="#" variant="outlined" sx={{ my: 1, mx: 1.5 }}>
            {authContext.isLoggedIn ? "Log Out" : "Log In"}
          </Button>
        </Toolbar>
      </AppBar>
      <MenuDrawer open={menuOpen} setOpen={setMenuOpen} />
    </>
  );
}

export default function HomePage() {
  const authContext = useContext(AuthContext);

  const handleNewestSort = async () => {
    authContext.onSort({ sort: "newest" });
  };

  const handleActiveSort = async () => {
    authContext.onSort({ sort: "active" });
  };

  const handleUnanswered = async () => {
    authContext.onSort({ unanswered: true });
  };

  return (
    <>
      <HomeHeader />
      <ToggleButtonGroup color="primary" exclusive aria-label="Platform">
        <ToggleButton value="newest" onClick={handleNewestSort}>Newest</ToggleButton>
        <ToggleButton value="active" onClick={handleActiveSort}>Active</ToggleButton>
        <ToggleButton value="unanswered" onClick= {handleUnanswered}>Unanswered</ToggleButton>
      </ToggleButtonGroup>
      <QuestionDisplay questions={authContext.allQuestions} />{" "}
      {/* Conditionally render the QuestionDisplay component */}
    </>
  );
}
