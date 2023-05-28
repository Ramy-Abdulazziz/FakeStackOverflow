import { useContext, useEffect, useState } from "react";
import QuestionContext from "./questionContext";

import {
  Box,
  Container,
  Grid,
  Skeleton,
  Typography,
  Paper,
  Button,
} from "@mui/material/";
import { useParams } from "react-router-dom";
import axios from "axios";

function QuestionComments({ question }) {
  return <div></div>;
}

function QuestionHeader({ question }) {
  return (
    <Paper elevation={3} sx={{ borderRadius: 2, minHeight: 300 }}>
      <Container>
        <Grid
          container
          spacing={5}
          direction="column"
          justifyContent={"space-evenly"}
        >
          <Grid item>
            <Grid container>
              <Grid item>
                <Typography variant="h4">{question.title}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            sx={{
              wordWrap: "break-word",
            }}
          >
            <Typography variant="h5">{question.text}</Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
              sx={{ mb: 5 }}
            >
              {question.tags.map((tag, index) => (
                <Grid item key={index}>
                  <Button type="button" variant="contained">
                    {" "}
                    {tag.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
}
function QuestionDetail({ question }) {
  return (
    <Container>
      <QuestionHeader question={question} />
    </Container>
  );
}
export default function DetailedQuestionPage() {
  const questionContext = useContext(QuestionContext);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    const getQuestionDetails = async () => {
      try {
        setLoading(true);

        const getQuestionDetails = await axios.get(
          `http://localhost:8000/questions?id=${id}`
        );

        setQuestion(getQuestionDetails.data[0]);
        setAnswers(getQuestionDetails.data[0].answers);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    getQuestionDetails();
  }, [id]);

  return (
    <Container sx={{ mt: 20 }}>
      {" "}
      {loading ? (
        <Skeleton variant="box">{/* <QuestionDetail /> */}</Skeleton>
      ) : (
        <QuestionDetail question={question} />
      )}
    </Container>
  );
}
