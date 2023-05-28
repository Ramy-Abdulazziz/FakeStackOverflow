import { useContext, useEffect, useState } from "react";
import QuestionContext from "./questionContext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  Container,
  Grid,
  Skeleton,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
} from "@mui/material/";
import { useParams } from "react-router-dom";
import axios from "axios";
import FormatDateText from "../dateTextUtils";

function QuestionComments({ question }) {
  return <div></div>;
}

function QuestionHeader({ question }) {
  return (
    <Paper elevation={3} sx={{ borderRadius: 2, minHeight: 300 }}>
      <Container sx={{ maxWidth: 1800 }}>
        <Grid container justifyContent={"left"} spacing={2} direction={"row"}>
          <Grid item sx={{ maxwidth: 10 }}>
            <Grid
              container
              spacing={5}
              direction="column"
              justifyContent={"flex-start"}
              flexDirection={"column"}
            >
              <Grid item>
                <Button>
                  <KeyboardArrowUpIcon fontSize="large" />
                </Button>
              </Grid>
              <Grid item sx={{ ml: 2 }}>
                <Typography variant="h4">{question.upvotes}</Typography>
              </Grid>
              <Grid item>
                <Button>
                  <KeyboardArrowDownIcon fontSize="large" />
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item sx={{ maxWidth: 900 }}>
            <Grid
              container
              spacing={5}
              direction="column"
              justifyContent={"flex-start"}
            >
              <Grid
                item
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                }}
              >
                <Container>
                  <Typography variant="h4">{question.title}</Typography>
                </Container>
              </Grid>
              <Grid
                item
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                }}
              >
                <Container>
                  <Typography variant="h5">{question.text}</Typography>
                </Container>
              </Grid>
              <Grid item>
                <Container>
                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    sx={{ mb: 0 }}
                  >
                    {" "}
                    {question.tags.map((tag, index) => (
                      <Grid item key={index}>
                        <Button type="button" variant="contained">
                          {" "}
                          {tag.name}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Grid>

              <Grid item>
                <Grid
                  container
                  justifyContent={"flex-end"}
                  direction="row"
                  sx={{ mb: 2 }}
                >
                  <Grid item>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2} direction="column">
                          <Grid item>
                            <Typography variant="h6">
                              {FormatDateText.formatDateText(question.ask_date)}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Grid container spacing={2} direciton="row">
                              <Grid item>
                                <PersonIcon fontSize="large" />
                              </Grid>
                              <Grid item sx={{ mt: 0.7 }}>
                                <Typography variant="h6">
                                  {question.asked_by.user_name}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
}
function QuestionDetail({ question }) {
  return (
    <Container sx={{ maxWidth: 1800 }}>
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
    <Container sx={{ mt: 20, maxWidth: 1800 }}>
      {" "}
      {loading ? (
        <Skeleton variant="box">{/* <QuestionDetail /> */}</Skeleton>
      ) : (
        <QuestionDetail question={question} />
      )}
    </Container>
  );
}
