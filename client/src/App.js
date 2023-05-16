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
import GuestHome from "./components/guestHome";
import UserHome from "./components/userHome";
import { useState, useEffect, useContext } from "react";
import axios from "axios";

function App() {
  const darkTheme = createTheme({ palette: { mode: "dark" } });
  let testQuestions = MockQuestions.getQuestions();

  const [loggedIn, setLoggedIn] = useState(false);
  axios.defaults.withCredentials = true;

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginModal />} />
          <Route path="/sign-up" element={<SignUpModal />} />
          <Route
            path="/qtest"
            element={<QuestionDisplay questions={testQuestions} />}
          />
          <Route
            path="/home/"
            element={loggedIn ? <UserHome /> : <GuestHome />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
