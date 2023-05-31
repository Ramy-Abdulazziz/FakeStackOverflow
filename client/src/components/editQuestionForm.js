import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import {
  TextField,
  Button,
  Stack,
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
} from "@mui/material";
import { useContext } from "react";
import AuthContext from "./authContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionContext from "./questionContext";
import AdminContext from "./adminContext";

const validateLinks = (bodyText) => {
  let linkRegex = new RegExp("\\[([^\\s\\]]+)\\]\\((.*?)\\)", "g");
  let valid = true;
  let linkAttempt = bodyText.match(linkRegex);
  let validLinkRegex = new RegExp(
    "\\[((.|\\s)*\\S(.|\\s)*?)\\]\\((https?:\\/\\/\\S+)\\)"
  );

  if (linkAttempt != null) {
    linkAttempt.forEach((link) => {
      if (!validLinkRegex.test(link)) {
        valid = false;
      }
    });
  }

  return valid;
};
const splitTags = (tags) => {
  console.log(tags);
  if (tags === null || tags === "" || tags === undefined) return [];
  let splitTags = Array.from(tags.match(new RegExp("[^\\b\\s+]+", "g")));

  return splitTags;
};
const validateQuestionTags = (questionTags) => {
  console.log(questionTags);
  let invalid = new RegExp(
    "[\\w-?\\w]{11,}|([^\\w\\-]|_)|(?:^|\\s)-\\w+|\\w-(?!\\w)",
    "g"
  );
  let splitTags = Array.from(
    questionTags.match(new RegExp("[^\\b\\s+]+", "g"))
  );

  let badTags = splitTags.some((tag) => tag.match(invalid));

  return !badTags;
};
// Define validation schema using Yup

// Your form component
const QuestionForm = () => {
  const validationSchema = Yup.object().shape({
    title: Yup.string().max(50, "Maximum 50 characters allowed").required(),
    summary: Yup.string()
      .max(140, "Maximum 140 characters allowed")
      .required("Summary is required"),
    text: Yup.string()
      .test("validate-links", "Invalid link", (value) => validateLinks(value))
      .required("Text is required"),
    tags: Yup.string()
      .test("tag-length", "Tag is too long, max 10 characters", (value) => {
        console.log(value);
        if (value === undefined || value === null || value === "") return true;
        const tags = splitTags(value);
        for (let i = 0; i < tags.length; i++) {
          if (tags[i].length > 10) {
            return false;
          }
        }
        return true;
      })
      .test("validate-tags", "Invalid tags", (value) => {
        if (value === undefined || value === null || value === "") return true;
        return validateQuestionTags(value);
      })
      .test(
        "max-tags",
        "To many tags please deselect existing or remove new tags",
        (value) => {
          const newTagsLength = splitTags(value).length;
          const existingTagsLegnth = userTags.length;

          return newTagsLength + existingTagsLegnth <= 5;
        }
      )
      .test(
        "user-reputation",
        "Reputation needs to be at least 50 to create new tags",
        (value) => {
          const userReputation = authContext.reputation;
          if (value === undefined || value === null || value === "") {
            return true;
          }
          return userReputation >= 50;
        }
      )
      .test("no-tags", "Please add at least one tag", (value) => {
        const newTagsLength = splitTags(value).length;
        const existingTagsLegnth = userTags.length;
        console.log(newTagsLength + existingTagsLegnth);
        return newTagsLength + existingTagsLegnth > 0;
      }),
  });
  const formMethods = useForm({
    resolver: yupResolver(validationSchema),
  });

  const authContext = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [userTags, setUserTags] = useState([]);
  const [questionDetails, setQuestionDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminContext = useContext(AdminContext);
  const questionContext = useContext(QuestionContext);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getAllTags = async () => {
      try {
        const allTags = await axios.get(`http://localhost:8000/tags`);
        console.log(allTags.data);
        setTags(allTags.data);
      } catch (err) {
        console.error(err);
      }
    };

    getAllTags();
  }, []);

  useEffect(() => {
    const getQuestionInfo = async () => {
      try {
        const question = await axios.get(
          `http://localhost:8000/questions?id=${id}`
        );
        console.log(question.data[0]);
        setQuestionDetails(question.data[0]);
        const tagNames = question.data[0].tags.map((tag) => tag.name);
        setUserTags(tagNames);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getQuestionInfo();
  }, []);
  useEffect(() => {
    if (questionDetails) {
      formMethods.reset({
        title: questionDetails.title,
        summary: questionDetails.summary,
        text: questionDetails.text,
        existingTags: questionDetails.tags,
        tags: "", // put default value for new tags here
      });
    }
  }, [questionDetails]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = formMethods;
  const handleOnSubmit = (data) => {
    // You can replace the url with your actual server endpoint

    const updatedQInfo = {
      user: authContext.userId,
      title: data.title,
      summary: data.summary,
      text: data.text,
      existingTags: userTags,
      newTags: splitTags(data.tags),
      question: id,
    };

    console.log(updatedQInfo);
    questionContext.handleEdit(updatedQInfo);
    adminContext.refreshUser();
    navigate("/home");
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setUserTags(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleDelete = async () => {
    questionContext.handleDelete(id);
    adminContext.refreshUser();

    navigate("/home");
  };
  return loading ? (
    <Skeleton variant="square" />
  ) : (
    <Paper elevation={3} sx={{ height: 800, mt: 20, paddingTop: 5 }}>
      <Container>
        <Typography variant="h4" sx={{ width: 400, ml: "auto", mr: "auto" }}>
          Submit New Question
        </Typography>
      </Container>
      <Container sx={{ mt: 10, width: 500 }}>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
          <Stack spacing={5} direction={"column"} sx={{ width: 500 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  label="Title"
                  multiline
                  sx={{ mt: 1 }}
                  variant="filled"
                  defaultValue={questionDetails.title}
                />
              )}
            />
            <Controller
              name="summary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.summary}
                  helperText={errors.summary?.message}
                  multiline
                  label="Summary"
                  variant="filled"
                  value={field.value || questionDetails.summary}
                />
              )}
            />
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.text}
                  helperText={errors.text?.message}
                  label="Text"
                  multiline
                  rows={4}
                  variant="filled"
                  value={field.value || questionDetails.text}
                />
              )}
            />
            <Controller
              name="existingTags"
              control={control}
              render={({ field }) => (
                <FormControl variant="filled">
                  <InputLabel id="existing-tags-label">
                    Existing Tags
                  </InputLabel>
                  <Select
                    {...field}
                    multiple
                    labelId="existing-tags-label"
                    onChange={handleChange}
                    defaultValue={questionDetails.tags.map((tag) => tag.name)}
                    value={userTags}
                  >
                    {tags.map((t) => (
                      <MenuItem key={t.name} value={t.name}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="tags"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.tags}
                  helperText={errors.tags?.message}
                  label={"New Tags"}
                  variant="filled"
                />
              )}
            />
          </Stack>
          <Grid container direction={"row"} justifyContent={"flex-end"}>
            <Grid item sx={{ mr: 2, mt: 5 }}>
              <Button type="submit" variant="contained">
                Submit{" "}
              </Button>
            </Grid>
            <Grid item sx={{ mr: -5, mt: 5 }}>
              <Button onClick={handleDelete} variant="contained">
                Delete
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Paper>
  );
};

export default function EditQuestionForm() {
  const authContext = useContext(AuthContext);

  return (
    <Box>
      <Container sx={{ ml: "auto", mr: "auto" }}>
        <QuestionForm userReputation={50} />
      </Container>
    </Box>
  );
}
