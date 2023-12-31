/* eslint-disable react-hooks/exhaustive-deps */
import { useContext } from "react";
import AuthContext from "./authContext";
import QuestionContext from "./questionContext";
import FormatDateText from "../dateTextUtils";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Stack,
  Skeleton,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

function UserQuestions() {
  const questionContext = useContext(QuestionContext);
  const authContext = useContext(AuthContext);
  const [userQuestions, setUserQuestions] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getUserQuestion = async () => {
      questionContext.fetchUser();
      console.log(authContext); 
      try {
        const response = await axios.get(
          `http://localhost:8000/questions/user/${authContext.userId}`
        );
        setUserQuestions(response.data);
      } catch (err) {
        console.log(err);
      }
      setUserQuestions(questionContext.userQuestions);
      setOpen(questionContext.userQuestions.length === 0);
    };

    getUserQuestion();
  }, []);
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="User Questions">
          <TableHead>
            <TableRow sx={{ backgroundColor: "black" }}>
              <TableCell>
                <Typography variant="h4"> Your Questions</Typography>{" "}
              </TableCell>
            </TableRow>
          </TableHead>
          {userQuestions.map((q) => (
            <TableRow key={q._id}>
              <TableCell>
                <Link to={`/question/user/edit/${q._id}`}>
                  <Typography variant="h5"> {q.title}</Typography>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </TableContainer>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          You Dont Have Any Questions
        </Alert>
      </Snackbar>
    </>
  );
}

function UserHeader() {
  const authContext = useContext(AuthContext);
  const [userQuestions, setUserQuestions] = useState([]);

  useEffect(() => {
    const getUserQuestion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/questions/user/${authContext.userId}`
        );
        setUserQuestions(response.data);

        // const answers = await axios.get(
        //   `http://localhost:8000/answer/user/${authContext.userId}`
        // );
        // setUserAnswers(answers.data);
      } catch (err) {
        console.error(err);
      }
    };
    getUserQuestion();
  }, []);

  const stringAvatar = (name) => {
    return {
      sx: {
        bgcolor: "grey",
      },
      children: `${name.charAt(0)}`,
    };
  };
  return (
    <Box>
      <Paper
        elevation={3}
        sx={{ borderRadius: 2, minHeight: 200, mt: 10, paddingBottom: 2 }}
      >
        <Container>
          <Grid
            container
            spacing={5}
            direction={"row"}
            justifyContent={"space-evenly"}
          >
            <Grid item>
              <Grid
                container
                spacing={2}
                direction={"column"}
                justifyContent={"space-evenly"}
              >
                <Grid item>
                  <Avatar
                    {...stringAvatar(authContext.userName)}
                    sx={{ width: 100, height: 100, fontSize: 50 }}
                  />
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant={"h4"} sx={{ mt: 2, ml: 2 }}>
                  {authContext.userName}
                </Typography>
              </Grid>
            </Grid>

            <Grid item>
              <Card sx={{ width: 300 }}>
                <CardContent>
                  <Grid container spacing={2} direction={"column"}>
                    <Grid item>
                      <Typography variant={"h5"}>
                        {FormatDateText.formatDateText(
                          authContext.signUp,
                          "Joined"
                        )}
                      </Typography>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={2} direction={"row"}>
                        <Grid item>
                          <LiveHelpIcon fontSize="large" />
                        </Grid>

                        <Grid item>
                          <Typography variant={"h5"}>
                            {userQuestions.length}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                   

                    <Grid item>
                      <Stack direction={"row"} spacing={2}>
                        <EmojiEmotionsIcon fontSize="large" />
                        <Typography variant="h5">
                          {authContext.reputation}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Paper>
    </Box>
  );
}
export default function UserProfile() {
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);
  useEffect(() => {
    authContext.refreshUserInfo();
    questionContext.fetchUser();
  }, []);
  return authContext.user === null ? (
    <Skeleton variant="square">
      {" "}
      <Container sx={{ width: 1000, height: 800 }} />
    </Skeleton>
  ) : (
    <>
      <UserHeader />
      <Container sx={{ mt: 10 }}>
        <UserQuestions />
      </Container>
    </>
  );
}
