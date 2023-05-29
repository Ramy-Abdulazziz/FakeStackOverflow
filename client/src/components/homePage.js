import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import { useState, useContext, useEffect } from "react";
import { Link, Typography } from "@mui/material";
import AuthContext from "./authContext";
import QuestionDisplay from "./questionDisplay";
import Paper from "@mui/material/Paper";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import QuestionContext from "./questionContext";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "./header";

export default function HomePage() {
  const questionContext = useContext(QuestionContext);
  const authContext = useContext(AuthContext);
  const [currentQuestions, setCurrentQuestions] = useState([]);

  useEffect(() => {
    const getQuestions = async () => {
      // questionContext.fetchAll();

      setCurrentQuestions(questionContext.displayedQuestions);

      if (authContext.isLoggedIn) {
        questionContext.fetchUser();
      }
    };

    getQuestions();
  }, []);

  useEffect(() => {
    setCurrentQuestions(questionContext.displayedQuestions);
  }, [questionContext.displayedQuestions]);

  const handleNewestSort = async () => {
    try {
      await questionContext.onSort({ sort: "newest" });
    } catch (err) {
      console.log(err);
    }
  };

  const handleActiveSort = async () => {
    try {
      await questionContext.onSort({ sort: "active" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnanswered = async () => {
    try {
      await questionContext.onSort({ unanswered: true });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container sx={{ maxHeight: "100%" }}>
      <Typography
        className="numQuestions"
        variant="h3"
        sx={{
          maxWidth: 300,
          ml: "auto",
          mr: "auto",
          mt: 5,
          mb: 5,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        {currentQuestions.length === 0
          ? "No Questions Found"
          : `${currentQuestions.length} Questions`}
      </Typography>
      <div className="filterButtonGroup">
        <ToggleButtonGroup
          color="primary"
          exclusive
          aria-label="Platform"
          sx={{}}
        >
          <ToggleButton value="newest" onClick={handleNewestSort}>
            Newest
          </ToggleButton>
          <ToggleButton value="active" onClick={handleActiveSort}>
            Active
          </ToggleButton>
          <ToggleButton value="unanswered" onClick={handleUnanswered}>
            Unanswered
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {questionContext.isLoading ? (
        <Skeleton variant="rectangular">
          <QuestionDisplay />
        </Skeleton>
      ) : (
        <QuestionDisplay cls={"qDisplayHome"} questions={currentQuestions} />
      )}
    </Container>
  );
}
