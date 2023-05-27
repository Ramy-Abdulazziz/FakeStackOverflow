import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .test(
      "notContainsUsername",
      "Password should not contain the username",
      function (value) {
        const { username } = this.parent;
        if (username && value.includes(username)) {
          return false;
        }
        return true;
      }
    )
    .test(
      "notContainsEmail",
      "Password should not contain the email",
      function (value) {
        const { email } = this.parent;
        const emailKey = email.split('@')[0];
        if (emailKey && value.includes(emailKey)) {
          return false;
        }
        return true;
      }
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

export default function SignUpModal() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [success, setSuccess] = useState(false);
  const darkTheme = createTheme({ palette: { mode: "dark" } });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    reset();
    try {
      await axios
        .post("http://localhost:8000/sign-up", data)
        .then((response) => {
          setErrorMessage([response.data.message]);
          setOpen(true);
          if (response.status === 201) {
            setSuccess(true);
            navigate("/");
          }
        });
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a non-2xx status code
        setErrorMessage([err.response.data.message]);
      } else {
        // Some other error occurred
        setErrorMessage(["Error adding user - please try again"]);
      }
      setOpen(true);
      setSuccess(false);
      console.log(err);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container component="main" maxWidth="xs">
        <Paper
          sx={{
            p: 2,
            marginTop: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 500,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#1A2027" : "#fff",
          }}
        >
          <Typography component="h1" variant="h5">
            Sign Up
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
            <Grid item xs="auto">
              <Typography component="p">Fill In Your Details Below</Typography>
            </Grid>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid item xs="auto">
                <TextField
                  {...register("username")}
                  id="outlined-required"
                  label="Username"
                />

                <Grid item>
                  {errors.username && (
                    <Typography component="p">
                      This field is required
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs="auto">
                <TextField
                  {...register("email")}
                  id="outlined-required"
                  label="Email"
                />
                <Grid item xs="auto">
                  {errors.email && (
                    <Typography component="p">
                      This field is required and should be a valid email
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs="auto">
                <TextField
                  {...register("password")}
                  id="outlined-password-input"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                />

                <Grid item xs="auto">
                  {errors.password && (
                    <Typography component="p">
                      {errors.password.message}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs="auto">
                <TextField
                  {...register("confirmPassword")}
                  id="outlined-confirm-password-input"
                  label="Confirm Password"
                  type="password"
                />
                <Grid item xs="auto">
                  {errors.confirmPassword && (
                    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert
                      onClose={handleClose}
                      severity={ "error"}
                    >
                      {errors.confirmPassword.message}
                    </Alert>
                  </Snackbar>
                  )}
                </Grid>
              </Grid>

              <Grid item xs="auto">
                <Button type="submit" variant="contained" sx={{ mt: 3, ml: 8 }}>
                  Sign Up
                </Button>
              </Grid>
            </form>

            <Grid item xs="auto">
              <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                Continue as Guest
              </Button>
            </Grid>
          </Grid>
        </Paper>
        <Grid
          container
          spacing={2}
          direction="row"
          sx={{
            alignItems: "center",
            mt: 2,
            ml: 8,
          }}
        >
          <Grid item>
            <Link href="/" variant="body2">
              {"Already have an account? Log In"}
            </Link>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={success === true ? "success" : "error"}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
