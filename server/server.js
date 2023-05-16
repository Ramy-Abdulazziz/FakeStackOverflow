// Application server
// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const cookieParser = require("cookie-parser");

const port = 8000;
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
// app.use(cookieParser());

// Connect to MongoDB
const mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("connected", function () {
  console.log("Connected to database");
});

//import models
const Question = require("./models/questions");
const Answer = require("./models/answers");
const Tag = require("./models/tags");
const User = require("./models/user");
const Comment = require("./models/comments");
const { restart } = require("nodemon");

//middleware authentication
const store = new MongoDBStore({
  uri: mongoDB,
  databaseName: "fake_so",
  collection: "userSessions",
});

store.on("error", function (error) {
  console.error("Error connecting to session storage");
});

app.use(
  session({
    secret: "This is a secret",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);

app.post("/login", async (req, res) => {
  try {
    console.log("log in attempted");
    console.log(req.session.id);

    const username = req.body.username;
    const password = req.body.password;

    console.log(username);
    console.log(password);

    let user = await User.findOne({ user_name: username }).exec();

    console.log(user.user_name);

    if (user) {
      let correctPass = await bcrypt.compare(password, user.password);

      if (correctPass) {
        console.log("Correct Password - logging in");
        req.session.userId = user._id;
        req.session.role = user.admin ? "admin" : "false"; // Store user ID in session
        res.status(200).json({ message: "user logged in successfully" });
      }
    }
  } catch (err) {
    console.error("error connecting", err);
  }
});

app.post("/guest", async (req, res) => {
  try {
    console.log("guest user logging in ");

    if (req.session && req.session.role) {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "error logging out previous session", err });
        }

        // Regenerate the session after destroy
        req.session = req.sessionStore.generate(req);
        req.session.role = "guest";
        console.log("successful guest login on server side");
        return res.status(200).json({ message: "guest login successful" });
      });
    } else {
      req.session.role = "guest";
      console.log("successful guest login on server side");
      return res.status(200).json({ message: "guest login successful" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error logging in as guest", err });
  }
});

//Define routes
app.put("/submit/question", async (req, res) => {
  console.log("receiving new question");
  try {
    const questionData = req.body;
    const tagsPromises = questionData.tags.map(async (tagName) => {
      const tag = await Tag.findOne({ name: tagName });
      if (tag) {
        return tag;
      } else {
        const newTag = new Tag({ name: tagName });
        await newTag.save();
        return newTag;
      }
    });
    const tags = await Promise.all(tagsPromises);

    questionData.tags = tags.map((tag) => tag._id);

    const newQuestion = new Question(questionData);
    await newQuestion.save();
    res
      .status(201)
      .json({ message: "Question added successfully", newQuestion });
  } catch (error) {
    console.error("Error in /submit/question:", error);
    res.status(500).json({ message: "Error adding question", error });
  }
});

app.put("/submit/:id/answer", async (req, res) => {
  console.log("receiving answer for question");
  try {
    const id = req.params.id;
    const answerData = req.body;
    const newAnswer = new Answer(answerData);
    await newAnswer.save();

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { $push: { answers: newAnswer._id } },
      { new: true, useFindAndModify: false }
    )
      .populate("answers")
      .exec();

    res
      .status(200)
      .json({ message: "Answer added successfully", updatedQuestion });
  } catch (error) {
    console.error("Error in /submit/answser:", error);
    res.status(500).json({ message: "Error adding answer", error });
  }
});

app.get("/questions", async (req, res) => {
  console.log("Received request for questions");

  try {
    const tagName = req.query.tagName;
    const unanswered = req.query.unanswered === "true";
    const sort = req.query.sort;
    const id = req.query.id;
    let query = {};

    console.log("sort", sort);
    if (tagName) {
      console.log("Received tagName:", tagName); // Add this line
      const tag = await Tag.findOne({ name: tagName });
      console.log("Found tag:", tag); // Add this line

      if (tag) {
        query.tags = { $in: [tag._id] };
      }
    }

    if (unanswered) {
      query.answers = { $size: 0 };
    }

    if (id) {
      query._id = id;
    }

    console.log("Query object:", query); // Add this line

    if (id) {
      const question = await Question.findOne({ _id: id })
        .populate("answers")
        .exec();
      questions = question ? [question] : [];
    } else {
      questions = await Question.find(query).populate("answers").exec();
    }

    if (sort === "newest") {
      questions.sort((a, b) => b.ask_date - a.ask_date);
    } else if (sort === "active") {
      questions.sort((a, b) => {
        if (a.answers.length == 0) {
          return 1;
        } else if (b.answers.length == 0) {
          return -1;
        } else if (a.answers.length == 0 && b.answers.length == 0) {
          return 0;
        } else {
          const lastAnswerA = a.answers[a.answers.length - 1];
          const lastAnswerB = b.answers[b.answers.length - 1];

          return lastAnswerB.ans_date_time - lastAnswerA.ans_date_time;
        }
      });
    }
    console.log("Sending questions:", questions);

    if (unanswered) {
      questions.sort((a, b) => b.ask_date - a.ask_date);
    }
    res.json(questions);
  } catch (err) {
    console.error("Error retrieving questions:", err);
    res.status(500).send("Error retrieving questions");
  }
});

app.get("/search", async (req, res) => {
  const searchText = req.query.text;
  const searchBy = req.query.by;

  if (!searchText || searchText.trim() === "") {
    res.json([]); // Return an empty array
    return;
  }

  let searchQuery;
  console.log(searchText);
  switch (searchBy) {
    case "text_and_title":
      const regexTextAndTitle = new RegExp(searchText, "i");
      searchQuery = {
        $or: [{ text: regexTextAndTitle }, { title: regexTextAndTitle }],
      };
      break;
    case "tags":
      const tag = await Tag.findOne({ name: searchText });
      console.log("searching for " + tag.name);
      searchQuery = { tags: { $in: [tag._id] } };
      break;
    case "links":
      const linkRegex = new RegExp("\\[([^\\s\\]]+)\\]\\((.*?)\\)", "g");
      const questionsWithLinks = await Question.find({
        text: { $regex: linkRegex },
      });
      const foundQuestions = questionsWithLinks.filter((q) => {
        const links = q.text.match(linkRegex);
        return links.some((link) => {
          const words = link.match(/(\w+)/g);
          const lowerCaseWords = words.map((word) => word.toLowerCase());
          return lowerCaseWords.some((word) => searchText.includes(word));
        });
      });
      return res.json(foundQuestions);
    default:
      res.status(400).json({ error: "Invalid searchBy parameter" });
      return;
  }

  try {
    const foundQuestions = await Question.find(searchQuery);
    res.json(foundQuestions);
  } catch (err) {
    console.error("Error searching questions:", err);
    res.status(500).json({ error: "Failed to search questions" });
  }
});

app.get("/questions/:id/answers", async (req, res) => {
  console.log("received request for answers");
  try {
    const questionId = req.params.id;
    const question = await Question.findById(questionId).populate("answers");
    res.json(question.answers);
  } catch (error) {
    console.error("Error fetching question answers");
    res.status(500).json({ message: "Error fetching question answers", error }); // Add this line
  }
});

app.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find().exec();
    res.json(tags);
  } catch (err) {
    res.status(500).send("Error retrieving questions");
  }
});

app.get("/tags/:id/name", async (req, res) => {
  console.log("Received request for tagNames");
  try {
    console.log("Received request for tagNames"); // Add this line to log the request

    const tagId = req.params.id;
    console.log(tagId);
    const tag = await Tag.findById(tagId);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    console.log("SENDING TAG NAMES:" + tag.name);
    res.send(tag.name);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tag name", error });
  }
});

app.get("/answer", async (req, res) => {
  try {
    const questions = await Answer.find().exec();
    res.json(questions);
  } catch (err) {
    res.status(500).send("Error retrieving questions");
  }
});

app.put("/questions/:id/views", async (req, res) => {
  try {
    const questionId = req.params.id;
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error updating question views", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle server termination
process.on("SIGINT", function () {
  db.close(() => {
    console.log("Server closed. Database instance disconnected");
    process.exit(0);
  });
});
