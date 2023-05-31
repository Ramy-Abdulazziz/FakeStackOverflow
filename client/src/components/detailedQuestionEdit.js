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
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";

import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { useLocation } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import FormatDateText from "../dateTextUtils";
import AuthContext from "./authContext";

function AnswerComments({ answer }) {
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
    comment: yup.string().max(140).required(),
  });

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (authContext.userRole !== "guest") {
      try {
        console.log(authContext);
        const newComment = {
          text: data.comment,
          userId: authContext.userId, // replace this with actual user ID
          parentId: answer._id,
          parentType: "Answer",
        };

        console.log(newComment);
        const response = await axios.post("http://localhost:8000/comment", {
          text: data.comment,
          userId: authContext.userId, // replace this with actual user ID
          parentId: answer._id,
          parentType: "Answer",
        });

        // Add the new comment to the state
        const qComments = await axios.get(
          `http://localhost:8000/answer/${answer._id}/comments`
        );

        setComments(qComments.data);

        // Reset the form
        reset();
      } catch (err) {
        console.error(err);
      }
    } else {
      setErrorMessage("You cant comment as a guest - please log in");
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
          `http://localhost:8000/answer/${answer._id}/comments`
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
          <SingleComment key={c._id} comment={c} />
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

function SingleAnswer({ answer }) {
  const questionContext = useContext(QuestionContext);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [answr, setAnswer] = useState(answer);
  const authContext = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [success, setSuccess] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");

  useEffect(() => {
    const getAnswerDetails = async () => {
      try {
        const ans = await axios.get(
          `http://localhost:8000/answer/${answer._id}`
        );
        console.log(ans);
        setAnswer(ans.data);
      } catch (err) {
        console.log(err);
      }
    };

    getAnswerDetails();
  }, []);

  const handleShowAComments = async () => {
    setShowComments(!showComments);
  };

  const handleEditClick = async () => {
    setIsEditing(true);
  };

  const handleUpvote = async () => {
    if (authContext.reputation >= 50) {
      try {
        const updatedAnswer = await axios.put(
          `http://localhost:8000/answer/${answer._id}/upvote`,
          { user: authContext.userId }
        );
        // After successfully upvoting, fetch the updated comment data.
        console.log(updatedAnswer.data);
        setAnswer(updatedAnswer.data);
      } catch (err) {
        console.error(err);
        setErrorMessage("failed to upvote - communication error");
        setOpen(true);
      }
    } else {
      setErrorMessage(
        authContext.userRole === "guest"
          ? "You cant vote as a guest"
          : "You need at least 50 reputation points to upvote."
      );
      setOpen(true);
    }
  };

  const handleDownVote = async () => {
    if (authContext.reputation >= 50) {
      try {
        const updatedAnswer = await axios.put(
          `http://localhost:8000/answer/${answer._id}/downvote`,
          { user: authContext.userId }
        );
        // After successfully upvoting, fetch the updated comment data.
        console.log(updatedAnswer.data);
        setAnswer(updatedAnswer.data);
      } catch (err) {
        console.error(err);
        setErrorMessage("failed to downvote - communication error");
        setOpen(true);
      }
    } else {
      setErrorMessage(
        authContext.userRole === "guest"
          ? "You cant vote as a guest"
          : "You need at least 50 reputation points to upvote."
      );
      setOpen(true);
    }
  };

  const handleNameChange = (event) => {
    setNewAnswer(event.target.value);
  };

  const emptyCheck = (content) => {
    console.log(content.replace(new RegExp("\\s+", "g"), ""));

    return content.replace(new RegExp("\\s+", "g"), "") === "";
  };

  const validateLinks = (bodyText) => {
    let linkRegex = new RegExp("\\[([^\\s\\]]+)\\]\\((.*?)\\)", "g");
    let valid = true;
    let linkAttempt = bodyText.match(linkRegex);
    let validLinkRegex = new RegExp(
      "\\[((.|\\s)*\\S(.|\\s)*?)\\]\\((https?:\\/\\/\\S+)\\)"
    );

    if (linkAttempt != null) {
      linkAttempt.forEach((link) => {
        if (!validLinkRegex.test(link)) {
          valid = false;
        }
      });
    }

    console.log(valid);
    return valid;
  };

  const validateText = (questionText) => {
    return !emptyCheck(questionText) && validateLinks(questionText);
  };

  // Add a function to handle editing
  const handleEdit = async () => {
    console.log(newAnswer);
    if (validateText(newAnswer) === false) {
      setErrorMessage("Please provide valid answer text");
      setOpen(true);
      return;
    }
    try {
      const updatedAnswer = await axios.put(
        `http://localhost:8000/answer/${answr._id}`,
        { text: newAnswer }
      );
      setAnswer(updatedAnswer.data.answer);
      setSuccess("Successfully updated answer");
      setIsEditing(false);
      setOpenSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error editing question");
      setOpen(true);
      setIsEditing(false);
    }
  };

  // Add a function to handle deleting
  const handleDelete = async () => {
    try {
      const confirmation = window.confirm(
        "Are you sure you want to delete this answer?"
      );

      if (!confirmation) {
        return;
      }

      const response = await axios.delete(
        `http://localhost:8000/answer/${answr._id}`
      );

      if (response.status === 200) {
        setSuccess("Successfully deleted answer");
        setOpenSuccess(true);
        setDeleted(true);
      }
    } catch (err) {
      console.error(err);
      alert("There was an error deleting the answer");
    }
  };

  return (
    <>
      {!deleted && (
        <>
          <Paper elevation={3} sx={{ borderRadius: 2, minHeight: 100 }}>
            <Container sx={{ maxWidth: 1800 }}>
              <Grid
                container
                spacing={2}
                direction={"row"}
                justifyContent={"space-evenly"}
              >
                {" "}
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
                        <KeyboardArrowUpIcon fontSize="small" />
                      </Button>
                    </Grid>
                    <Grid item sx={{ ml: 2 }}>
                      <Typography variant="h4">{answr.upvotes}</Typography>
                    </Grid>
                    <Grid item>
                      <Button onClick={handleDownVote}>
                        <KeyboardArrowDownIcon fontSize="small" />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  item
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  <Container sx={{ minWidth: 300 }}>
                    {isEditing ? (
                      <TextField
                        defaultValue={answr.text}
                        onChange={handleNameChange}
                      />
                    ) : (
                      <Typography variant="body1" sx={{}}>
                        {answr.text}
                      </Typography>
                    )}
                  </Container>
                </Grid>
                <Grid item>
                  <Card sx={{ minWidth: 230, mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} direction="column">
                        <Grid item>
                          <Typography variant="subtitle2">
                            {FormatDateText.formatDateText(answr.ans_date_time)}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Grid container spacing={2} direciton="row">
                            <Grid item>
                              <PersonIcon fontSize="medium" />
                            </Grid>
                            <Grid item sx={{ mt: 0.5 }}>
                              <Typography variant="subtitle2">
                                {answr.ans_by.user_name}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item>
                  {answr.ans_by._id === authContext.user._id && (
                    <Grid container spacing={2} direction="column">
                      <Grid item>
                        <Button
                          onClick={isEditing ? handleEdit : handleEditClick}
                        >
                          {isEditing ? <DownloadDoneIcon /> : <ModeEditIcon />}
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button onClick={handleDelete}>
                          <DeleteIcon />
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Container>
          </Paper>
          <Button
            onClick={handleShowAComments}
            sx={{ ml: "auto", mr: "auto", width: "100%" }}
          >
            {showComments ? (
              <ArrowDropUpIcon />
            ) : (
              <ArrowDropDownCircleIcon fontSize="large" />
            )}
          </Button>
        </>
      )}
      {showComments ? <AnswerComments answer={answer} /> : ""}
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
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClose={() => setOpenSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}

function Answers({ answers }) {
  const [currentPage, setCurrentPage] = useState(1);
  const numPerPage = 5;

  const indexOfLastAnswer = currentPage * numPerPage;
  const indexOfFirstAnswer = indexOfLastAnswer - numPerPage;

  const currentAnswers = answers.slice(indexOfFirstAnswer, indexOfLastAnswer);

  const totalPages = Math.ceil(answers.length / numPerPage);

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

  return (
    <>
      <Box sx={{ height: 400, overflow: "auto" }}>
        <Paper sx={{ mt: 5, paddingTop: 5, paddingBottom: 5 }}>
          <Container>
            {currentAnswers.map((a) => (
              <SingleAnswer answer={a} />
            ))}
          </Container>
        </Paper>
      </Box>
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
    </>
  );
}

function SingleComment({ comment }) {
  const [comm, setComment] = useState(comment);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const authContext = useContext(AuthContext);

  const handleUpvote = async () => {
    if (authContext.userRole !== "guest") {
      try {
        const updatedComment = await axios.put(
          `http://localhost:8000/comment/${comment._id}/upvote`,
          { user: authContext.userId }
        );
        // After successfully upvoting, fetch the updated comment data.
        console.log(updatedComment.data);
        setComment(updatedComment.data);
      } catch (err) {
        console.error(err);
        setErrorMessage("Communication error - upvote failed");
        setOpen(true);
      }
    } else {
      setErrorMessage("You cant vote as a guest");
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
              <Container sx={{ minWidth: 300 }}>
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
    comment: yup.string().max(140).required(),
  });

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (authContext.userRole !== "guest") {
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
        setErrorMessage("Communication error");
        setOpen(true);
        reset();
      }
    } else {
      setErrorMessage("You cant comment as a guest - please log in");
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
          <SingleComment key={c._id} comment={c} />
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
  const navigate = useNavigate();

  const handleTagClick = async (tagName) => {
    try {
      const tagQuestions = await axios.get(
        `http://localhost:8000/questions?tagName=${tagName}`
      );

      const questions = {
        tagQuestions: tagQuestions.data,
      };
      questionContext.handleTagClick(questions);
      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };
  const handleUpvote = async () => {
    console.log(authContext.reputation);

    if (authContext.reputation > 50) {
      questionContext.handleUpvote(question);

      try {
        const updated = await axios.get(
          `http://localhost:8000/questions?id=${question._id}`
        );

        setVotes(updated.data[0].upvotes);
      } catch (err) {
        console.log(err);
        setErrorMessage("Communication error");
        setOpen(true);
      }
    } else {
      setErrorMessage(
        authContext.userRole === "guest"
          ? "You cant vote as a guest"
          : "You need at least 50 reputation points to upvote."
      );
      setOpen(true);
    }
  };

  const handleDownVote = async () => {
    console.log(authContext.reputation);
    if (authContext.reputation > 50) {
      questionContext.handleDownvote(question);

      try {
        const updated = await axios.get(
          `http://localhost:8000/questions?id=${question._id}`
        );

        setVotes(updated.data[0].upvotes);
      } catch (err) {
        console.log(err);
        setErrorMessage("Communication error");
        setOpen(true);
      }
    } else {
      setErrorMessage(
        authContext.userRole === "guest"
          ? "You cant vote as a guest"
          : "You need at least 50 reputation points to downvote."
      );
      setOpen(true);
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ borderRadius: 2, minHeight: 300 }}>
        <Container sx={{ maxWidth: 1800 }}>
          <Grid
            container
            justifyContent={"left"}
            spacing={2}
            direction={"row"}
            sx={{ minWidth: 1300 }}
          >
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

            <Grid item sx={{ width: 900 }}>
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
                          <Button
                            onClick={() => handleTagClick(tag.name)}
                            type="button"
                            variant="contained"
                          >
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

                            <Grid item>
                              <Grid container spacing={4} direction={"row"}>
                                <Grid item>
                                  <QuestionAnswerIcon />
                                </Grid>

                                <Grid item>
                                  <Typography variant="h6">
                                    {question.answers.length}
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
export default function DetailedQuestionEditPage() {
  const questionContext = useContext(QuestionContext);
  const authContext = useContext(AuthContext);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQComments, setShowQComments] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
        console.log("getting question details" + getQuestionDetails);
        console.log(getQuestionDetails);
        setQuestion(getQuestionDetails.data[0]);
        setAnswers(
          getQuestionDetails.data[0].answers.sort((a, b) => {
            if (
              a.ans_by.toString() === authContext.userId &&
              b.ans_by.toString() === authContext.userId
            ) {
              return b.ans_date_time - a.ans_date_time; // descending order by date for user's answers
            } else if (a.ans_by.toString() === authContext.userId) {
              return -1;
            } else if (b.ans_by.toString() === authContext.userId) {
              return 1;
            } else {
              return b.ans_date_time - a.ans_date_time; // descending order by date for other users' answers
            }
          })
        );
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    getQuestionDetails();
  }, [questionContext.allQuestions]);

  const handleAddNewClick = async () => {
    if (authContext.userRole === "guest") {
      setOpen(true);
    } else {
      navigate(`/question/${id}/answer/add`);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Container sx={{ mt: 10, maxWidth: 1800 }}>
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

            <Answers answers={answers} />
          </>
        )}
      </Container>
      <Box className="stickyButton" sx={{ mt: 5 }}>
        <Grid container justifyContent={"flex-end"}>
          <Grid item>
            <Fab
              onClick={handleAddNewClick}
              className="stickyButton"
              color="primary"
            >
              <AddIcon />
            </Fab>
          </Grid>
        </Grid>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          You cannot add a new answser as a guest - please log in
        </Alert>
      </Snackbar>
    </>
  );
}
