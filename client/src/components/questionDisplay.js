import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Grid } from "@mui/material";
import { useState } from "react";
import FormatDateText from "../dateTextUtils";

function SingleQuestionContainer({ question }) {
  const darkTheme = createTheme({ palette: { mode: "dark" } });

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          width: 800,
          height: 200,
          borderRadius: 5,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#121212" : "#fff",
        }}
      >
        <Grid
          container
          spacing={5}
          direction="row"
          mt={2}
          sx={{
            alignItems: "center",
          }}
        >
          <Grid
            item
            sx={{
              ml: 5,
              mt: 2,
            }}
          >
            <Typography component="p" color={"grey"}>
              {question.answers.length}
            </Typography>
            <Typography component="p" color={"grey"}>
              {question.views} views
            </Typography>
          </Grid>
          <Grid
            item
            sx={{
              flexWrap: "wrap",
            }}
          >
            <Grid
              container
              spacing={2}
              direction="column"
              sx={{
                alignItems: "center",
              }}
            >
              <Grid
                item
                sx={{
                  wordWrap: "break-word",
                  width: 450,
                }}
              >
                <Link href="/question/:id" variant="body2">
                  {question.title}
                </Link>
              </Grid>
              <Grid
                item
                sx={{
                  wordWrap: "break-word",
                  width: 450,
                }}
              >
                <Typography component="p" color={"grey"}>
                  {question.summary}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sx={{ mt: 2 }}>
            <Typography component="p" color={"grey"}>
              asked by {question.asked_by.user_name}
            </Typography>
            <Typography component="p" color={"grey"}>
              {FormatDateText.formatDateText(question.ask_date)}
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              spacing={2}
              direction="row"
              ml={15}
              sx={{
                alignItems: "center",
              }}
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
      </Box>
    </ThemeProvider>
  );
}

export default function QuestionDisplay({ questions }) {
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
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <Container
        className="questionDisplay"
        sx={{
          mt: 10,
          mr: 10,
        }}
      >
        {currentQuestions.map((q, index) => (
          <SingleQuestionContainer key={index} question={q} />
        ))}
      </Container>
      <Pagination
        boundaryCount={2}
        count={totalPages}
        hidePrevButton={currentPage === 1}
        onChange={handlePageChange}
        page={currentPage}
        sx={{ ml: 50 }}
      />
    </div>
  );
}
