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
import { useContext } from "react";
import AuthContext from "./authContext";
import QuestionContext from "./questionContext";
import FormatDateText from "../dateTextUtils";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminContext from "./adminContext";
import axios from "axios";

function UserQuestions() {
  const questionContext = useContext(QuestionContext);
  const [userQuestions, setUserQuestions] = useState([]);
  const adminContext = useContext(AdminContext);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getUserQuestion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/questions/user/${adminContext.handlingUserID}`
        );
        setUserQuestions(response.data);
        setOpen(userQuestions.length === 0);
      } catch (err) {
        console.error(err);
      }
      adminContext.fetchUser();
    };

    getUserQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminContext.loadingQuestions]);
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
            <TableRow>
              <TableCell>
                <Link to={`/question/user/edit/${q._id}/admin`}>
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
  const adminContext = useContext(AdminContext);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  useEffect(() => {
    const getUserQuestion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/questions/user/${adminContext.handlingUserID}`
        );
        setUserQuestions(response.data);

        const answers = await axios.get(
          `http://localhost:8000/answer/user/${adminContext.handlingUserID}`
        );
        setUserAnswers(answers.data);
      } catch (err) {
        console.error(err);
      }
    };
    getUserQuestion();
  }, [adminContext.loadingQuestions]);

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
                    {...stringAvatar(adminContext.handlingUsername)}
                    sx={{ width: 100, height: 100, fontSize: 50 }}
                  />
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant={"h4"} sx={{ mt: 2, ml: 2 }}>
                  {adminContext.handlingUsername}
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
                          adminContext.handlingUser.sign_up_date,
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
                      <Grid container spacing={2} direction={"row"}>
                        <Grid item>
                          <QuestionAnswerIcon fontSize="large" />
                        </Grid>

                        <Grid item>
                          <Typography variant={"h5"}>
                            {userAnswers.length}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Stack direction={"row"} spacing={2}>
                        <EmojiEmotionsIcon fontSize="large" />
                        <Typography variant="h5">
                          {adminContext.handlingUser.reputation}
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
export default function AdminUserProfile() {
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);
  const adminContext = useContext(AdminContext);
  useEffect(() => {
    questionContext.fetchUser();
    console.log(adminContext);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return authContext.isLoading ? (
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
