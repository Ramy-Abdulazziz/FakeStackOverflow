// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import "./stylesheets/App.css";
import FakeStackOverflow from "./components/fakestackoverflow.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SignUpModal from "./components/signUpModal";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginModal from "./components/loginModal";
import MockQuestions from "./components/mockQuestions";
import QuestionDisplay from "./components/questionDisplay";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContextProvider from "./components/AuthContextProvider";
import HomePage from "./components/homePage";

function App() {
  const darkTheme = createTheme({ palette: { mode: "dark" } });

  axios.defaults.withCredentials = true;

  return (
    <AuthContextProvider>
      <ThemeProvider theme={darkTheme}>
        <Router>
          <Routes>
            <Route path="/" element={<LoginModal />} />
            <Route path="/sign-up" element={<SignUpModal />} />
            <Route path="/qtest" element={<QuestionDisplay />} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default App;
