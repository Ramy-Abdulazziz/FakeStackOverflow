import { useContext, useEffect, useState } from "react";
import QuestionContext from "./questionContext";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import AuthContext from "./authContext";
import QuizIcon from "@mui/icons-material/Quiz";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import {
  Box,
  Container,
  Skeleton,
  Typography,
  Grid,
  Button,
  CardActionArea,
  Divider,
  Badge,
  typographyClasses,
  Stack,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

function SingleTagContainer({ tag }) {
  const questionContext = useContext(QuestionContext);
  const navigate = useNavigate();

  const [tagQuestions, setTagQuestions] = useState([]);

  useEffect(() => {
    const getTagQuestions = async () => {
      try {
        const tagQuestions = await axios.get(
          `http://localhost:8000/questions?tagName=${tag.name}`
        );

        setTagQuestions(tagQuestions.data);
      } catch (err) {
        console.log(err);
      }
    };
    getTagQuestions();
  }, []);
  const handleClick = () => {
    try {
      questionContext.handleTagClick({ tagQuestions });
      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Grid item>
      <Card sx={{ minWidth: 200 }}>
        <CardActionArea onClick={() => handleClick(tag.name)}>
          <CardContent>
            <Container sx={{ width: "100%" }}>
              <Grid container spacing={3}>
                <Grid item>
                  <Typography variant="h5" sx={{ ml: "auto", mr: "auto" }}>
                    {tag.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Badge
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    color="primary"
                    badgeContent={tagQuestions.length}
                    max={50}
                  >
                    <QuizIcon />
                  </Badge>
                </Grid>
              </Grid>
            </Container>
          </CardContent>
        </CardActionArea>
        <Divider />
        <CardContent>
          <Stack justifyContent={"space-evenly"} spacing={2} direction={"row"}>
            <Button>
              <ModeEditIcon />
            </Button>
            <Button>
              <DeleteIcon />
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default function UserTagsPage() {
  const [tagsArray, setTags] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const getUserTags = async () => {
      try {
        setLoading(true);
        const userTags = await axios.get(
          `http://localhost:8000/user/tags/${id}`
        );
        setTags(userTags.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getUserTags();
  }, []);

  return (
    <Box sx={{ width: "100%", height: "100%", mt: 10, alignContent: "center" }}>
      <Container>
        <Typography
          variant="h3"
          sx={{ ml: "auto", mr: "auto", width: 300, color: "white" }}
        >
          {" "}
          User Tags{" "}
        </Typography>
      </Container>
      <Container sx={{ mt: 10 }}>
        <Grid
          container
          spacing={2}
          direction={"row"}
          justifyContent="center"
          alignItems={"center"}
          sx={{ ml: "auto", mr: "auto" }}
        >
          {isLoading ? (
            <Skeleton variant="rectangular">
              <Box sx={{ width: 1000, height: 600, mt: 10 }} />
            </Skeleton>
          ) : (
            tagsArray.map((tag) => (
              <SingleTagContainer key={tag._id} tag={tag} />
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}
