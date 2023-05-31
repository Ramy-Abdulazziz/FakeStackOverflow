import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link} from "react-router-dom";
import Paper from "@mui/material/Paper";
import { Card, CardContent } from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Grid } from "@mui/material";
import { useContext, useState } from "react";
import FormatDateText from "../dateTextUtils";
import axios from "axios";
import QuestionContext from "./questionContext";

function SingleQuestionContainer({ question, userPage, adminPage }) {
  const darkTheme = createTheme({ palette: { mode: "dark" } });
  const questionContext = useContext(QuestionContext);

  const handleTagClick = async (tagName) => {
    try {
      const tagQuestions = await axios.get(
        `http://localhost:8000/questions?tagName=${tagName}`
      );

      const questions = {
        tagQuestions: tagQuestions.data,
      };
      questionContext.handleTagClick(questions);
      // navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container sx={{}}>
        <Paper elevation={4} sx={{ mb: 2, mt: 2, borderRadius: 2 }}>
          <Grid
            container
            spacing={10}
            direction="row"
            justifyContent="space-evenly"
            sx={{
              mt: 1,
            }}
          >
            <Grid
              item
              sx={{
                flexWrap: "wrap",
                width: 500,
              }}
            >
              <Grid
                container
                spacing={2}
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                sx={{
                  mb: 2,
                }}
              >
                <Grid
                  item
                  sx={{
                    wordWrap: "break-word",
                  }}
                >
                  <Link
                    onClick={() =>
                      questionContext.handleQuestionClick(question._id)
                    }
                    to={
                      userPage
                        ? `/user/${question._id}/answers`
                        : adminPage
                        ? `/admin/user/${question._id}/answers`
                        : `/answers/${question._id}`
                    }
                  >
                    <Typography variant="h6">{question.title}</Typography>
                  </Link>
                </Grid>
                <Grid
                  item
                  sx={{
                    wordWrap: "break-word",
                  }}
                >
                  <Typography component="p" color={"grey"}>
                    {question.summary}
                  </Typography>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    sx={{}}
                  >
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
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Card sx={{ minWidth: 230, mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} direction={"column"}>
                    <Grid item>
                      <Grid container spacing={2} direction={"row"}>
                        <Grid item>
                          <Typography>
                            {FormatDateText.formatDateText(question.ask_date)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={2} direction={"row"}>
                        <Grid item>
                          <PersonIcon />
                        </Grid>
                        <Grid item>
                          <Typography>{question.asked_by.user_name}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={2} direction={"row"}>
                        <Grid item>
                          <VisibilityIcon />
                        </Grid>
                        <Grid item>
                          <Typography>{question.views}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={2} direction={"row"}>
                        <Grid item>
                          <ThumbUpAltIcon />
                        </Grid>

                        <Grid item>
                          <Typography>{question.upvotes}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={2} direction={"row"}>
                        <Grid item>
                          <QuestionAnswerIcon />
                        </Grid>

                        <Grid item>
                          <Typography>{question.answers.length}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>{" "}
    </ThemeProvider>
  );
}

export default function QuestionDisplay({
  questions,
  userPage = false,
  adminPage = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const totalPages = Math.ceil(questions.length / questionsPerPage);

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
      <Box sx={{ height: 550, overflow: "auto" }}>
        <Container sx={{}}>
          <Paper
            elevation={1}
            sx={{ borderRadius: 2, paddingTop: 2, paddingBottom: 2 }}
          >
            {currentQuestions.map((q, index) => (
              <SingleQuestionContainer
                key={index}
                question={q}
                userPage={userPage}
                adminPage={adminPage}
              />
            ))}
          </Paper>
        </Container>
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
