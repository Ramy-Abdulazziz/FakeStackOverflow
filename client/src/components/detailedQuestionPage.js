import { useContext, useEffect, useState } from "react";
import QuestionContext from "./questionContext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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
  TextField,
  Pagination,
  Alert,
  Snackbar,
} from "@mui/material/";
import { useParams } from "react-router-dom";
import axios from "axios";
import FormatDateText from "../dateTextUtils";
import AuthContext from "./authContext";

function SingleComment({ comment }) {
  const [comm, setComment] = useState(comment);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const authContext = useContext(AuthContext);

  const handleUpvote = async () => {
    if (authContext.reputation >= 50) {
      try {
        await axios.put(`http://localhost:8000/comment/${comment._id}/upvote`);
        // After successfully upvoting, fetch the updated comment data.
        // Alternatively, you could have the server return the updated comment data, and use that instead.
        const updatedComment = await axios.get(
          `http://localhost:8000/comment/${comment._id}`
        );
        setComment(updatedComment.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setErrorMessage("You need at least 50 reputation points to upvote.");
      setOpen(true);
    }
  };
  return (
    <>
      <Paper
        elevation={2}
        sx={{
          mr: "auto",
          ml: "auto",
          mt: 5,
          mb: 2,
          borderRadius: 2,
          maxWidth: 800,
        }}
      >
        <Grid
          container
          spacing={2}
          direction={"row"}
          justifyContent={"space-evenly"}
        >
          <Grid item>
            <Grid
              container
              spacing={2}
              direction="column"
              justifyContent={"flex-start"}
              flexDirection={"column"}
            >
              <Grid item>
                <Button onClick={handleUpvote}>
                  <ThumbUpIcon fontSize="small" />
                </Button>
              </Grid>
              <Grid item sx={{ ml: 3, mb: 0 }}>
                <Typography variant="body2">{comm.upvotes}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Grid
              item
              sx={{
                overflowWrap: "break-word",
                wordWrap: "break-word",
              }}
            >
              <Container>
                <Typography variant="body1" sx={{}}>
                  {comment.text}
                </Typography>
              </Container>
            </Grid>
          </Grid>

          <Grid item>
            <Grid item>
              <Card sx={{ minWidth: 230, mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} direction="column">
                    <Grid item>
                      <Typography variant="subtitle2">
                        {FormatDateText.formatDateText(comm.date_created)}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid container spacing={2} direciton="row">
                        <Grid item>
                          <PersonIcon fontSize="medium" />
                        </Grid>
                        <Grid item sx={{ mt: 0.5 }}>
                          <Typography variant="subtitle2">
                            {comm.created_by.user_name}
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
      </Paper>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

function QuestionComments({ question }) {
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const authContext = useContext(AuthContext);
  const numPerPage = 3;

  const indexOfLastComment = currentPage * numPerPage;
  const indexOfFirstComment = indexOfLastComment - numPerPage;

  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const totalPages = Math.ceil(comments.length / numPerPage);

  const schema = yup.object().shape({
    comment: yup.string().required(),
  });

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (authContext.reputation > 50) {
      try {
        console.log(authContext);
        const newComment = {
          text: data.comment,
          userId: authContext.userId, // replace this with actual user ID
          parentId: question._id,
          parentType: "Question",
        };

        console.log(newComment);
        const response = await axios.post("http://localhost:8000/comment", {
          text: data.comment,
          userId: authContext.userId, // replace this with actual user ID
          parentId: question._id,
          parentType: "Question",
        });

        // Add the new comment to the state
        const qComments = await axios.get(
          `http://localhost:8000/question/${question._id}/comments`
        );

        setComments(qComments.data);

        // Reset the form
        reset();
      } catch (err) {
        console.error(err);
      }
    } else {
      setErrorMessage(
        "You need at least 50 reputation points to leave a comment"
      );
      reset();
      setOpen(true);
    }
  };

  const handlePageChange = (event, pageNumber) => {
    if (pageNumber > totalPages) {
      setCurrentPage(1);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  const handleNext = () => {
    if (currentPage === totalPages) {
      setCurrentPage(1);
    } else {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage === 1) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    const getAllComments = async () => {
      try {
        const qComments = await axios.get(
          `http://localhost:8000/question/${question._id}/comments`
        );

        setComments(qComments.data);
      } catch (err) {
        console.error(err);
      }
    };

    getAllComments();
  }, []);
  return (
    <>
      <Container sx={{ paddingTop: 2, paddingBottom: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Container sx={{ width: "80%" }}>
            <TextField
              {...register("comment")}
              label="new comment"
              variant="outlined"
              sx={{
                width: "100%",
                borderRadius: 5,
                "& fieldset": { borderRadius: 8 },
              }}
            />
          </Container>
          <Box sx={{ display: "flex", justifyContent: "right", mr: 17, mt: 2 }}>
            <Button variant="contained" type="submit">
              Add Comment
            </Button>
          </Box>
        </form>
        {currentComments.map((c) => (
          <SingleComment comment={c} />
        ))}
        <Container sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {currentPage === 1 ? (
              <Button disabled onClick={handlePrev}>
                <NavigateBeforeIcon />
              </Button>
            ) : (
              <Button onClick={handlePrev}>
                <NavigateBeforeIcon />
              </Button>
            )}
            <Pagination
              boundaryCount={2}
              count={totalPages}
              hidePrevButton
              hideNextButton
              onChange={handlePageChange}
              page={currentPage}
              sx={{ width: "100%" }}
            />
            <Button onClick={handleNext}>
              <NavigateNextIcon />
            </Button>
          </Box>
        </Container>
      </Container>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

function QuestionHeader({ question }) {
  const questionContext = useContext(QuestionContext);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const authContext = useContext(AuthContext);
  const [votes, setVotes] = useState(question.upvotes);

  const handleUpvote = async () => {
    console.log(authContext.reputation)

    if (authContext.reputation > 50) {
      questionContext.handleUpvote(question);

      try {
        const updated = await axios.get(
          `http://localhost:8000/questions?id=${question._id}`
        );

        setVotes(updated.data[0].upvotes);
      } catch (err) {
        console.log(err);
      }
    } else {
      setErrorMessage("You need at least 50 reputation to vote");
      setOpen(true);
    }
  };

  const handleDownVote = async () => {
    console.log(authContext.reputation)
    if (authContext.reputation > 50) {
      questionContext.handleDownvote(question);

      try {
        const updated = await axios.get(
          `http://localhost:8000/questions?id=${question._id}`
        );

        setVotes(updated.data[0].upvotes);
      } catch (err) {
        console.log(err);
      }
    } else {
      setErrorMessage("You need at least 50 reputation to vote");
      setOpen(true);
    }
  };

  return (
    <>
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
                  <Button onClick={handleUpvote}>
                    <KeyboardArrowUpIcon fontSize="large" />
                  </Button>
                </Grid>
                <Grid item sx={{ ml: 2 }}>
                  <Typography variant="h4">{votes}</Typography>
                </Grid>
                <Grid item>
                  <Button onClick={handleDownVote}>
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
                                {FormatDateText.formatDateText(
                                  question.ask_date
                                )}
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
                              <Grid container spacing={2} direciton="row">
                                <Grid item sx={{ ml: 0.5, mt: 2 }}>
                                  <VisibilityIcon />
                                </Grid>
                                <Grid item>
                                  <Typography
                                    sx={{ mt: 1.6, ml: 1, mb: 0 }}
                                    variant="h6"
                                  >
                                    {question.views}
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
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
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
  const [showQComments, setShowQComments] = useState(false);

  const { id } = useParams();

  const handleShowQComments = async () => {
    setShowQComments(!showQComments);
  };
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
        <>
          <Paper>
            <QuestionDetail question={question} />
            <Button
              onClick={handleShowQComments}
              sx={{ ml: "auto", mr: "auto", width: "100%" }}
            >
              {showQComments ? (
                <ArrowDropUpIcon />
              ) : (
                <ArrowDropDownCircleIcon fontSize="large" />
              )}
            </Button>
            {showQComments ? <QuestionComments question={question} /> : ""}
          </Paper>
        </>
      )}
    </Container>
  );
}
