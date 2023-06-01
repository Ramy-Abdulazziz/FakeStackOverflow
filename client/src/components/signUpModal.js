import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { Stack } from "@mui/material";
import AuthContext from "./authContext";
import QuestionContext from "./questionContext";

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
        const emailKey = email.split("@")[0];
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
  const formMethods = useForm({
    resolver: yupResolver(schema),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = formMethods;

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);

  const handleGuestLogin = async () => {
    try {
      await axios.post("http://localhost:8000/guest").then((response) => {
        if (response.status === 200) {
          authContext.onLogin(response.data);
          questionContext.fetchAll();
          navigate("/home");
        } else {
          setErrorMessage("Error signing up - try again");
          setOpen(true);
        }
      });
    } catch (err) {
      console.log("error", err);
      setErrorMessage("Error signing up - try again");

      setOpen(true);
    }
  };
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
    <>
      {" "}
      <Container sx={{ ml: "auto" }}>
        <Typography
          variant="h3"
          sx={{ color: "grey", width: 200, ml: "auto", mr: "auto", mt: 5 }}
        >
          Sign Up
        </Typography>
      </Container>
      <Grid
        container
        spacing={5}
        direction="column"
        mt={2}
        sx={{
          alignItems: "center",
        }}
      >
        <Grid item>
          <Typography variant="h5" sx={{ color: "grey" }}>
            Fill In Your Details Below
          </Typography>
        </Grid>
      </Grid>
      <Paper elevation={3} sx={{ height: 750, mt: 5, paddingTop: 5 }}>
        <Container>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack
              spacing={5}
              direction={"column"}
              sx={{ width: 300, ml: "auto", mr: "auto", mt: 5 }}
            >
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    label="username"
                    multiline
                    sx={{ mt: 1 }}
                    variant="filled"
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    label="email"
                    multiline
                    sx={{ mt: 1 }}
                    variant="filled"
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    label="password"
                    type="password"
                    sx={{ mt: 1 }}
                    variant="filled"
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    label="confirmPassword"
                    sx={{ mt: 1 }}
                    variant="filled"
                    type="password"
                  />
                )}
              />

              {errors.confirmPassword && (
                <Snackbar
                  open={open}
                  autoHideDuration={6000}
                  onClose={handleClose}
                >
                  <Alert onClose={handleClose} severity={"error"}>
                    {errors.confirmPassword.message}
                  </Alert>
                </Snackbar>
              )}

              <Button type="submit" variant="contained" sx={{ mt: 3, ml: 8 }}>
                Sign Up
              </Button>
            </Stack>
          </form>
          <Stack sx={{ width: 300, ml: "auto", mr: "auto", mt: 5 }}>
            <Button
              type="button"
              onClick={handleGuestLogin}
              variant="contained"
              sx={{ mt: 3 }}
            >
              Continue as Guest
            </Button>
            <Container sx={{ mt: 3, ml: 1 }}>
              <Link href="/" variant="body2">
                {"Already have an account? Log In"}
              </Link>
            </Container>
          </Stack>
        </Container>
      </Paper>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={success === true ? "success" : "error"}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
