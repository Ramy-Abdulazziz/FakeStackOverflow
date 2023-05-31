import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import MenuDrawer from "./menuDrawer";
import { styled, alpha } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useContext } from "react";
import AuthContext from "./authContext";
import axios from "axios";
import Link from "@mui/material/Link";
import QuestionContext from "./questionContext";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";

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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const questionContext = useContext(QuestionContext);

  const location = useLocation();
  const navigate = useNavigate();

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
      <AppBar position="static" className="header">
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
          {location.pathname !== "/" && location.pathname !== "/sign-up" ? (
            <Search
              onChange={questionContext.onInputChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate("/home");
                  questionContext.onSearch(event);
                }
              }}
            >
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          ) : (
            ""
          )}
        </Toolbar>
      </AppBar>
      <MenuDrawer open={menuOpen} setOpen={setMenuOpen} />
    </>
  );
}
