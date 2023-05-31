/* eslint-disable react-hooks/exhaustive-deps */
import Skeleton from "@mui/material/Skeleton";
import { useState, useContext, useEffect } from "react";
import { Typography } from "@mui/material";
import AuthContext from "./authContext";
import QuestionDisplay from "./questionDisplay";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import QuestionContext from "./questionContext";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const questionContext = useContext(QuestionContext);
  const authContext = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const navigate = useNavigate();
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

  const handleAddNewClick = async () => {
    if (authContext.userRole === "guest") {
      setOpen(true);
    } else {
      navigate("/question/add");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
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
          You cannot add a new question as a guest - please log in
        </Alert>
      </Snackbar>
    </>
  );
}
