import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AuthContext from "./authContext";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import { useState, useContext } from "react";
import axios from "axios";

import Header from "./header";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import QuestionContext from "./questionContext";

export default function LoginModal({ username }) {
  const darkTheme = createTheme({ palette: { mode: "dark" } });
  const [loginError, setLoginError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { handleSubmit, control } = useForm();
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      await axios.post("http://localhost:8000/login", data).then((response) => {
        if (response.status === 200) {
          authContext.onLogin(response.data);
          console.log(response.data);
          setLoginSuccess(true);
          navigate("/home");
        } else {
          setLoginError(true);
        }
      });
    } catch (err) {
      console.log("error", err);
      setLoginError(true);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await axios.post("http://localhost:8000/guest").then((response) => {
        if (response.status === 200) {
          authContext.onLogin(response.data);
          questionContext.fetchAll();
          navigate("/home");
        } else {
          setLoginError(true);
        }
      });
    } catch (err) {
      console.log("error", err);
      setLoginError(true);
    }
  };

  const handleClose = () => {
    setLoginSuccess(false);
    setLoginError(false);
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <Header loggedIn={false} />
      <Container component="main" maxWidth="xs">
        <form onSubmit={handleSubmit(handleLogin)}>
          <Paper
            sx={{
              p: 2,
              marginTop: 25,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 350,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#1A2027" : "#fff",
            }}
          >
            <Typography component="h1" variant="h5">
              Welcome {username}
            </Typography>
            <Grid
              container
              spacing={5}
              direction="column"
              mt={2}
              sx={{
                alignItems: "center",
              }}
            >
              <Grid item xs={5}>
                <Controller
                  name="username"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField {...field} label="Username" required />
                  )}
                />
              </Grid>
              <Grid item xs="auto">
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  )}
                />
              </Grid>

              <Grid
                container
                spacing={2}
                direction="row"
                wrap="wrap"
                sx={{
                  alignItems: "center",
                  ml: 3,
                  width: "auto",
                }}
              >
                <Grid item xs="auto">
                  <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                    Sign In
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </form>
        <Grid
          container
          spacing={2}
          direction="row"
          sx={{
            alignItems: "center",
            mt: 5,
            ml: 8,
          }}
        >
          <Grid item xs="auto">
            <Button
              type="button"
              variant="contained"
              onClick={handleGuestLogin}
              sx={{ mt: 3, ml: 3 }}
            >
              Continue as Guest
            </Button>
          </Grid>
          <Grid item>
            <Link href="/sign-up" variant="body2" sx={{ ml: 2 }}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={loginSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Successful Login!
        </Alert>
      </Snackbar>

      <Snackbar open={loginError} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          Login Failed
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
