// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import "./stylesheets/App.css";
import FakeStackOverflow from "./components/fakestackoverflow.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SignUpModal from "./components/signUpModal";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginModal from "./components/loginModal";
import { Container } from "@mui/material";
import MockQuestions from "./components/mockQuestions";
import QuestionDisplay from "./components/questionDisplay";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContextProvider from "./components/AuthContextProvider";
import HomePage from "./components/homePage";
import QuestionContextProvider from "./components/questionContextProvider";
import Header from "./components/header";
import Box from "@mui/material/Box";

function App() {
  const darkTheme = createTheme({ palette: { mode: "dark" } });

  axios.defaults.withCredentials = true;

  return (
    <AuthContextProvider>
      <QuestionContextProvider>
        <ThemeProvider theme={darkTheme}>
          <Router>
            <Header />
            <Box sx={{maxHeight:'100%'}}>
            <Container sx={{ maxWidth: "100%" }}>
              <Routes>
                <Route path="/" element={<LoginModal />} />
                <Route path="/sign-up" element={<SignUpModal />} />
                <Route path="/home" element={<HomePage />} />
              </Routes>
            </Container>
            </Box>
          </Router>
        </ThemeProvider>
      </QuestionContextProvider>
    </AuthContextProvider>
  );
}

export default App;
