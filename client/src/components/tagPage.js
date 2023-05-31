import { useContext, useEffect, useState } from "react";
import QuestionContext from "./questionContext";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import AuthContext from "./authContext";
import QuizIcon from "@mui/icons-material/Quiz";
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
} from "@mui/material";
import { useNavigate } from "react-router";

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
      </Card>
    </Grid>
  );
}

export default function TagPage() {
  const [tagsArray, setTagArray] = useState([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const getAllTags = async () => {
      setLoading(true);
      try {
        const tags = await axios.get("http://localhost:8000/tags");
        setTagArray(tags.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getAllTags();
  }, []);

  return (
    <Box sx={{ width: "100%", height: "100%", mt: 10 }}>
      <Typography
        variant="h3"
        sx={{ ml: "auto", mr: "auto", width: 200, color: "white" }}
      >
        {" "}
        All Tags{" "}
      </Typography>
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
