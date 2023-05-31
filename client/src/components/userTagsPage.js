import { useContext, useEffect, useState } from "react";
import QuestionContext from "./questionContext";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import AuthContext from "./authContext";
import QuizIcon from "@mui/icons-material/Quiz";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
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
  Stack,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

function SingleTagContainer({ tag }) {
  const questionContext = useContext(QuestionContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [tagName, setTagName] = useState(tag.name);
  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSucess] = useState(false);
  const [sucess, setSucess] = useState("");
  const [error, setError] = useState("");
  const [tagQuestions, setTagQuestions] = useState([]);
  const [changedName, setChangedName] = useState(tag.name);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const getTagQuestions = async () => {
      try {
        const tagQuestions = await axios.get(
          `http://localhost:8000/questions?tagName=${changedName}`
        );

        setTagQuestions(tagQuestions.data);
        console.log(tagQuestions.data);
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

  const handleEditClick = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/tags/${changedName}/usedby`
      );

      if (response.status === 200) {
        setIsEditing(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setOpenError(true);
        setError(
          "Cannot edit or delete a tag that is being used by another user"
        );
        setIsEditing(false);
      } else {
        console.error(err);
      }
    }
  };

  const handleNameChange = (event) => {
    setTagName(event.target.value);
  };

  const emptyCheck = (content) => {
    return content.replace(new RegExp("\\s+", "g"), "") === "";
  };

  const validateQuestionTags = (questionTags) => {
    // let moreThanTenChars = new RegExp('[\\w-?\\w]{10,}', 'g')
    // let invalidChars = new RegExp('[^\w\-]|_', 'g');
    // let hyphenAtBegining = new RegExp('(?:^|\s)-\w+', 'g');
    if (emptyCheck(questionTags)) return false;

    let invalid = new RegExp(
      "[\\w-?\\w]{11,}|([^\\w\\-]|_)|(?:^|\\s)-\\w+|\\w-(?!\\w)",
      "g"
    );
    let splitTags = Array.from(
      questionTags.match(new RegExp("[^\\b\\s+]+", "g"))
    );

    if (splitTags.length > 5) return false;

    let badTags = splitTags.some((tag) => tag.match(invalid));

    return !badTags;
  };

  const handleNameSubmit = async () => {
    if (validateQuestionTags(tagName) === false) {
      setError("Please enter a valid tag name");
      setOpenError(true);
      return;
    }
    try {
      const data = {
        newTagName: tagName,
      };

      const response = await axios.put(
        `http://localhost:8000/tags/edit/${changedName}`,
        data
      );

      if (response.status === 200) {
        setChangedName(tagName);
        setSucess("Successfully changed tag name");
        setOpenSucess(true);
      }
      setIsEditing(false);
    } catch (err) {
      setError("Error editing tag");
      setOpenError(true);
      setIsEditing(false);

      console.error(err);
    }
  };

  const handleClose = () => {
    setOpenError(false);
    setOpenSucess(false);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/tags/${changedName}/usedby`
      );

      if (response.status === 200) {
        const isDel = await axios.delete(
          `http://localhost:8000/tags/delete/${changedName}`
        );

        if (isDel.status === 200) {
          setSucess("Successfully deleted tag");
          setOpenSucess(true);
          setIsDeleted(true);
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setOpenError(true);
        setError(
          "Cannot edit or delete a tag that is being used by another user"
        );
      } else {
        console.error(err);
      }
    }
  };
  return (
    <>
      {!isDeleted && (
        <Grid item>
          <Card sx={{ minWidth: 200 }}>
            {isEditing ? (
              <TextField
                defaultValue={changedName}
                onChange={handleNameChange}
              />
            ) : (
              <CardActionArea onClick={() => handleClick(tag.name)}>
                <CardContent>
                  <Container sx={{ width: "100%" }}>
                    <Grid container spacing={3}>
                      <Grid item>
                        <Typography
                          variant="h5"
                          sx={{ ml: "auto", mr: "auto" }}
                        >
                          {changedName}
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
            )}
            <Divider />
            <CardContent>
              <Stack
                justifyContent={"space-evenly"}
                spacing={2}
                direction={"row"}
              >
                <Button
                  onClick={isEditing ? handleNameSubmit : handleEditClick}
                >
                  {isEditing ? <DownloadDoneIcon /> : <ModeEditIcon />}
                </Button>
                <Button onClick={handleDelete}>
                  <DeleteIcon />
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}
      <Snackbar open={openError} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {sucess}
        </Alert>
      </Snackbar>
    </>
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
