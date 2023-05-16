import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

export default function Header({ loggedIn = false }) {
  let status = loggedIn === true ? "Logout" : "Login";
  return (
    <AppBar
      position="static"
      color="default"
      elevation={5}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ flexWrap: "wrap" }}>
        <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
          FakeStackOverflow
        </Typography>
        {/* <nav>
          <Link
            variant="button"
            color="text.primary"
            href="#"
            sx={{ my: 1, mx: 1.5 }}
          >
            Questions
          </Link>
          <Link
            variant="button"
            color="text.primary"
            href="#"
            sx={{ my: 1, mx: 1.5 }}
          >
            Answers
          </Link>
          <Link
            variant="button"
            color="text.primary"
            href="#"
            sx={{ my: 1, mx: 1.5 }}
          >
            Tags
          </Link>
        </nav> */}
        <nav>
          <Link
            variant="button"
            color="text.primary"
            href="/qtest"
            sx={{ my: 1, mx: 1.5 }}
          >
            Questions
          </Link>
        </nav>
        <Button href="#" variant="outlined" sx={{ my: 1, mx: 1.5 }}>
          {status}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
