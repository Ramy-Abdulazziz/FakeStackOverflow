// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import "./stylesheets/App.css";
import FakeStackOverflow from "./components/fakestackoverflow.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SignUpModal from "./components/signUpModal";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import LoginModal from "./components/loginModal";
import { Container } from "@mui/material";
import QuestionDisplay from "./components/questionDisplay";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContextProvider from "./components/AuthContextProvider";
import HomePage from "./components/homePage";
import QuestionContextProvider from "./components/questionContextProvider";
import Header from "./components/header";
import Box from "@mui/material/Box";
import TagPage from "./components/tagPage";
import DetailedQuestionPage from "./components/detailedQuestionPage";
import UserProfile from "./components/userProfile";
import UserAnsweredPage from "./components/userAnswersPage";
import UserTagsPage from "./components/userTagsPage";
import AddQuestionForm from "./components/addQuestionForm";
import AddAnswer from "./components/addAnswerForm";
import EditQuestionForm from "./components/editQuestionForm";
import DetailedQuestionEditPage from "./components/detailedQuestionEdit";
import AdminProfile from "./components/adminProfile";
import AdminContextProvider from "./components/adminContextProvider";
import AdminUserProfile from "./components/adminUserProfile";
import AdminUserAnsweredPage from "./components/adminUserAnswers";
import AdminDetailedQuestionEditPage from "./components/adminDetailedQuestionEdit";
import AdminContext from "./components/adminContext";
import AdminUserTagsPage from "./components/adminUserTags";

function App() {
  const darkTheme = createTheme({ palette: { mode: "dark" } });

  axios.defaults.withCredentials = true;

  return (
    <AuthContextProvider>
      <AdminContextProvider>
        <QuestionContextProvider>
          <ThemeProvider theme={darkTheme}>
            <Router>
              <Header />
              <Box sx={{ maxHeight: "100%", maxWidth: 1800 }}>
                <Container sx={{ maxWidth: 1800 }}>
                  <Routes>
                    <Route path="/" element={<LoginModal />} />
                    <Route path="/sign-up" element={<SignUpModal />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/all-tags" element={<TagPage />} />
                    <Route
                      path="/answers/:id"
                      element={<DetailedQuestionPage />}
                    />
                    <Route path="/user/:id" element={<UserProfile />} />
                    <Route
                      path="/user/:id/questions"
                      element={<UserAnsweredPage />}
                    />
                    <Route path="/user/:id/tags" element={<UserTagsPage />} />
                    <Route path="/question/add" element={<AddQuestionForm />} />
                    <Route
                      path="/question/:id/answer/add"
                      element={<AddAnswer />}
                    />
                    <Route
                      path="/question/user/edit/:id"
                      element={<EditQuestionForm />}
                    />
                    <Route
                      path="/user/:id/answers"
                      element={<DetailedQuestionEditPage />}
                    />
                    <Route path="/admin/:id" element={<AdminProfile />} />
                    <Route
                      path="/admin/user/:id/profile"
                      element={<AdminUserProfile />}
                    />

                    <Route
                      path="/admin/user/:id/tags"
                      element={<AdminUserTagsPage />}
                    />

                    <Route
                      path="/admin/user/:id/questions"
                      element={<AdminUserAnsweredPage />}
                    />
                      <Route
                      path="/admin/user/:id/answers"
                      element={<AdminDetailedQuestionEditPage />}
                    />
                  </Routes>
                </Container>
              </Box>
            </Router>
          </ThemeProvider>
        </QuestionContextProvider>
      </AdminContextProvider>
    </AuthContextProvider>
  );
}

export default App;
