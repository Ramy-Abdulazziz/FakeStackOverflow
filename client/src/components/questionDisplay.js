import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Grid } from "@mui/material";
import { useState } from "react";
import FormatDateText from "../dateTextUtils";

function SingleQuestionContainer({ question }) {
  const darkTheme = createTheme({ palette: { mode: "dark" } });

  return (
    <ThemeProvider theme={darkTheme}>
      <Container>
        <Paper elevation={2} sx={{ mb: 2, mt: 2, borderRadius: 2 }}>
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
                ml: 2,
              }}
            >
              <Typography component="p" color={"grey"}>
                {question.answers.length} answers
              </Typography>
              <Typography component="p" color={"grey"}>
                {question.views} views
              </Typography>
            </Grid>
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
                  <Link href="/question/:id" variant="body2">
                    {question.title}
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
                        <Button type="button" variant="contained">
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
              <Grid
                container
                spacing={5}
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
              >
                <Grid item sx={{}}>
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
                    direction={"row"}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                  >
                    <Grid item>
                      <Button>
                        <ThumbUpAltIcon />
                        <Typography component="p" color={"grey"} sx={{ ml: 2 }}>
                          {question.upvotes}
                        </Typography>
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button>
                        <ThumbDownAltIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Container>{" "}
    </ThemeProvider>
  );
}

export default function QuestionDisplay({ questions, cls }) {
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
    <>
      <Box sx={{ height: 600, overflow: "auto" }}>
        <Container sx={{}}>
          <Paper elevation={1} variant="outlined" sx={{ borderRadius: 2 }}>
            {currentQuestions.map((q, index) => (
              <SingleQuestionContainer key={index} question={q} />
            ))}
          </Paper>
        </Container>
      </Box>
      <Container sx={{mt:1}}>
        <Pagination
          boundaryCount={2}
          count={totalPages}
          hidePrevButton={currentPage === 1}
          onChange={handlePageChange}
          page={currentPage}
          sx={{ml:'50%', mr:'50%', minWidth:100}}
        />
      </Container>
    </>
  );
}
