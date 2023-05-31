/* eslint-disable react-hooks/exhaustive-deps */
import Skeleton from "@mui/material/Skeleton";
import { useState, useContext, useEffect } from "react";
import { Typography } from "@mui/material";
import AuthContext from "./authContext";
import QuestionDisplay from "./questionDisplay";
import QuestionContext from "./questionContext";
import Container from "@mui/material/Container";
import axios from "axios";

export default function UserAnsweredPage() {
  const questionContext = useContext(QuestionContext);
  const authContext = useContext(AuthContext);
  const [currentQuestions, setCurrentQuestions] = useState([]);

  useEffect(() => {
    const getQuestions = async () => {
      // questionContext.fetchAll();

      try {
        const questions = await axios.get(
          `http://localhost:8000/questions/answered/${authContext.userId}`
        );
        let uniqueQuestionsMap = new Map();

        questions.data.forEach((q) => {
          uniqueQuestionsMap.set(q._id, q);
        });

        let uniqueQuestions = Array.from(uniqueQuestionsMap.values());
        setCurrentQuestions(uniqueQuestions);
      } catch (err) {
        console.log(err);
      }
    };

    getQuestions();
  }, []);

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

      {questionContext.isLoading ? (
        <Skeleton variant="rectangular">
          <QuestionDisplay />
        </Skeleton>
      ) : (
        <QuestionDisplay
          cls={"qDisplayHome"}
          questions={currentQuestions}
          userPage={true}
        />
      )}
    </Container>
  );
}
