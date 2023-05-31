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
  Button,
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
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminContext from "./adminContext";

function Users() {
  const questionContext = useContext(QuestionContext);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext);
  const adminContext = useContext(AdminContext);

  useEffect(() => {
    const getUsers = async () => {
      const allUsers = await axios.get(
        `http://localhost:8000/admin/${authContext.userId}/users`
      );
      console.log(allUsers);
      setUsers(allUsers.data);
      setOpen(allUsers.data.length === 0);
    };

    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserClick = async (id) => {
    adminContext.onUserClick(id);
  };
  const handleDelete = async (id) => {
    try {
      if (id === authContext.userId) {
        setError("You cant delete yourself!");
        setOpenError(true);
        return;
      }
      const response = await adminContext.deleteUser(id);
      if(response === undefined){
        setSuccess("Deletion Cancelled")
        setOpenSuccess(true); 
        return;
      }
      if (response.status === 200) {
        setSuccess("User deleted successfully");
        setOpenSuccess(true);

        const allUsers = await axios.get(
          `http://localhost:8000/admin/${authContext.userId}/users`
        );
        setUsers(allUsers.data);
        setOpen(allUsers.data.length === 0);
        questionContext.fetchAll();
        questionContext.fetchUser();
        authContext.refreshUserInfo();
      } else {
        setError("Unable to delete user");
        setOpenError(true);
      }
    } catch (error) {
      setError("Unable to delete user");
      setOpenError(true);

      console.error(error);
    }
  };
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="User Questions">
          <TableHead>
            <TableRow sx={{ backgroundColor: "black" }}>
              <TableCell>
                <Typography variant="h4"> All Users</Typography>{" "}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell>
                <Link
                  to={`/admin/user/${u._id}/profile`}
                  onClick={() => handleUserClick(u)}
                >
                  <Typography variant="h5"> {u.user_name}</Typography>
                </Link>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleDelete(u._id)} sx={{ ml: 100 }}>
                  <HighlightOffIcon />
                </Button>
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
          No Users!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={() => setOpenSuccess(false)}
      >
        <Alert
          onClose={() => setOpenSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openError}
        autoHideDuration={6000}
        onClose={() => setOpenError(false)}
      >
        <Alert
          onClose={() => setOpenError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

function UserHeader() {
  const authContext = useContext(AuthContext);

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
                            {authContext.user.questions.length}
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
                            {authContext.user.answers.length}
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
export default function AdminProfile() {
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);
  useEffect(() => {
    authContext.refreshUserInfo();
    questionContext.fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Users />
      </Container>
    </>
  );
}
