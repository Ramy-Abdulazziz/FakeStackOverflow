import { Container, Paper, Typography, Box, Button } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate } from "react-router";

export default function ErrorPage() {

    const navigate = useNavigate(); 

    const reset = async () => {

        navigate('/');
        
        window.location.reload(); 

    } 
  return (
    <Container>
      <Paper>
        <Typography variant="h3" sx={{ mt: 10, color: "grey" }}>
          Uh Oh ! Seems like we had an error - Dont Worry You Can Start Again!
        </Typography>

        <Box sx={{ mt: 30, ml: 50, mr: "auto" }}>
          <Container>
            <BuildIcon
              fontSize="large"
              sx={{ fontSize: 250, color: "black" }}
            />
          </Container>
        </Box>
      </Paper>
      <Button onClick={reset} sx={{mt:5, ml:60}} ><RestartAltIcon sx={{ fontSize: 100 }}/></Button>
    </Container>
  );
}
