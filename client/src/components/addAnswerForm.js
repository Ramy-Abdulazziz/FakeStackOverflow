import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Stack,
  Box,
  Container,
  Paper,
  Grid,
  Typography,
 
} from "@mui/material";
import { useContext } from "react";
import AuthContext from "./authContext";
import { useNavigate, useParams } from "react-router-dom";
import QuestionContext from "./questionContext";

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

const AnswerForm = () => {
  const validationSchema = Yup.object().shape({
    text: Yup.string()
      .test("validate-links", "Invalid link", (value) => validateLinks(value))
      .required("Text is required"),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const authContext = useContext(AuthContext);
  const questionContext = useContext(QuestionContext);
  const navigate = useNavigate();

  const { id } = useParams();

  const handleOnSubmit = async (data) => {
    // You can replace the url with your actual server endpoint

    const newQInfo = {
      user: authContext.userId,
      question: id,
      text: data.text,
    };

    console.log(newQInfo);
    questionContext.handleAnswer(newQInfo);
    navigate(`/answers/${id}`);
  };

  return (
    <Paper elevation={3} sx={{ height: 500, mt: 20, paddingTop: 5 }}>
      <Container>
        <Typography variant="h4" sx={{ width: 400, ml: "auto", mr: "auto" }}>
          Submit New Answer
        </Typography>
      </Container>
      <Container sx={{ mt: 10, width: 500 }}>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
          <Stack spacing={5} direction={"column"} sx={{ width: 500 }}>
            <Controller
              name="text"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.text}
                  helperText={errors.text?.message}
                  label="Answer Text"
                  multiline
                  rows={10}
                  variant="filled"
                />
              )}
            />
          </Stack>
          <Grid container direction={"row"} justifyContent={"flex-end"}>
            <Grid item sx={{ mr: -5, mt: 5 }}>
              <Button type="submit" variant="contained">
                Submit{" "}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Paper>
  );
};

export default function AddAnswer() {
  return (
    <Box>
      <Container sx={{ ml: "auto", mr: "auto" }}>
        <AnswerForm userReputation={50} />
      </Container>
    </Box>
  );
}
