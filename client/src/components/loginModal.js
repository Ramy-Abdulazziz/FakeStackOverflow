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
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import QuestionContext from "./questionContext";

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),

  password: yup.string().required("Password is required"),
});

export default function LoginModal({ username }) {
  const darkTheme = createTheme({ palette: { mode: "dark" } });
  const [loginError, setLoginError] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);
  const navigate = useNavigate();

  const formMethods = useForm({
    resolver: yupResolver(schema),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = formMethods;
  useEffect(() => {
    const checkLoginStatus = async () => {
      if (authContext.isLoggedIn && authContext.userRole !== "guest") {
        console.log(authContext);
        navigate("/home");
      }
    };

    checkLoginStatus();
  }, [authContext.isLoggedIn, authContext.userRole, navigate]);
  const handleLogin = async (data) => {
    reset();

    try {
      await axios.post("http://localhost:8000/login", data).then((response) => {
        if (response.status === 200) {
          console.log(response);
          authContext.onLogin(response.data);
          questionContext.fetchAll();
          setLoginSuccess(true);
          navigate("/home");
        } else if (response.status === 401) {
          reset();

          setError("Username or password incorrect - please try again");
          setLoginError(true);
        }
      });
    } catch (err) {
      console.log("error", err);
      reset();

      setLoginError(true);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await axios.post("http://localhost:8000/guest").then((response) => {
        if (response.status === 200) {
          console.log(response.data);
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
      <Container className="login-modal" component="main" maxWidth="xs">
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
                    <TextField
                      {...field}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                      label="Username"
                    />
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
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      label="Password"
                      type="password"
                      autoComplete="current-password"
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
              sx={{ mt: 3, ml: 2 }}
            >
              Continue as Guest
            </Button>
          </Grid>
          <Grid item xs="auto">
            <Link href="/sign-up" variant="body2" sx={{}}>
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
          Username or email incorrect - please try again
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
