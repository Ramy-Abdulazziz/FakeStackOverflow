import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";

import Header from "./header";

import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function SignUpModal() {
  const darkTheme = createTheme({ palette: { mode: "dark" } });

  return (
    <ThemeProvider theme={darkTheme}>
      <Header />
      <Container component="main" maxWidth="xs">
        <Paper
          sx={{
            p: 2,
            marginTop: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 350,
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
              <Typography component="p">Choose Your Username</Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField required id="outlined-required" label="Username" />
            </Grid>
            <Grid item xs="auto">
              <Typography component="p">Enter Your Email</Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField required id="outlined-required" label="Email" />
            </Grid>
            <Grid item xs="auto">
              <Typography component="p">Choose A Password</Typography>
            </Grid>
            <Grid item xs="auto">
              <TextField
                required
                id="outlined-password-input"
                label="Password"
                type="password"
                autoComplete="current-password"
              />
            </Grid>
            <Grid item xs="auto">
              <Typography component="p">Confirm Your Password</Typography>
            </Grid>
            <Grid item xs="auto">
              <TextField
                required
                id="outlined-password-input"
                label="Password"
                type="password"
                autoComplete="current-password"
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
                  Sign Up
                </Button>
              </Grid>

              <Grid item xs="auto">
                <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                  Continue as Guest
                </Button>
              </Grid>
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
    </ThemeProvider>
  );
}
