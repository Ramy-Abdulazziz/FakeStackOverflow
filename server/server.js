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

//Create Session Storage for usersessions

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

/*
Routes for user authentication: 
- user login
- user logout
- guest login
- guest logout
- session validation
- user sign up
*/
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
        if (req.session && req.session.role && req.session.userId != user._id) {
          req.session.regenerate((err) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ message: "error regenerating session" });
            }

            console.log("previous log in detected, regenerating session");
          });
        } else if (req.session && req.session.userID === user._id) {
          console.log("user already logged in");
          res.status(200).json({ message: "user already logged in" });
        }
        console.log("Correct Password - logging in");
        req.session.userId = user._id;
        req.session.role = user.admin ? "admin" : "user"; // Store user ID in session
        res.status(200).json({
          message: "user logged in successfully",
          user_name: user.user_name,
          userID: user._id,
          userRole: user.admin ? "admin" : "user",
          reputation: user.reputation,
        });
      }
    }
  } catch (err) {
    console.error("error connecting", err);
  }
});

app.post("/logout", async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          res.sendStatus(500);
          console.error(err);
        } else {
          res.clearCookie("connect.sid");
          res.status(200).json({ message: "user successfully logged out" });
        }
      });
    } else {
      res.send(200).json({ message: "user is not logged in" });
    }
  } catch (err) {
    res.send(500).json({ message: "Error logging out user - try again" });
    console.error("error logging out", err);
  }
});

app.post("/guest", async (req, res) => {
  try {
    console.log("guest user logging in ");

    if (req.session && req.session.role) {
      console.log("regenerating session");

      req.session.regenerate((err) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "error regenerating session", err });
        }
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

app.get("/validate-session", async (req, res) => {
  try {
    if (req.session && req.session.role === ("user" || "admin")) {
      res.status(200).json({
        isLoggedIn: true,
        userID: req.session.userId,
        userRole: req.session.role,
      });
    } else if (req.session && req.session.role === "guest") {
      res.status(200).json({ isLoggedIn: true, userRole: "guest" });
    } else {
      res.status(200).json({ isLoggedIn: false });
    }
  } catch (error) {
    res.status(500).json({ message: "error getting session validation" });
    console.error(error);
  }
});

app.post("/sign-up", async (req, res) => {
  try {
    const userDetails = req.body;

    console.log(userDetails);

    const existingUser = await User.findOne({ email: userDetails.email });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPass = await bcrypt.hash(userDetails.password, 10);

    const newUser = new User({
      user_name: userDetails.username,
      email: userDetails.email,
      password: hashedPass,
    });

    await newUser.save();

    return res.status(201).json({ message: "New user added successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error adding user - please try again" });
  }
});

/**
 *
 * Routes for increasing and decreasing user reputation
 */

app.put("user/:id/increase/:amount/", async (req, res) => {
  try {
    const userId = req.params.id;
    const increase = req.params.amount;
    const updatedUser = User.findByIdAndUpdate(
      userId,
      { $inc: { reputation: increase } },
      { new: true }
    );

    if (!updatedUser) {
      res.send(401).json({ message: "user not found" });
    }
    res.send(200).json({ message: "user reputation decreased successfully" });
  } catch (err) {
    res.send(500).json({ message: "unable to increase user reputation" });
    console.error(err);
  }
});

app.put("user/:id/decrease/:amount/", async (req, res) => {
  try {
    const userId = req.params.id;
    const decrease = req.params.amount;
    const updatedUser = User.findByIdAndUpdate(
      userId,
      { $inc: { reputation: -decrease } },
      { new: true }
    );

    if (!updatedUser) {
      res.send(401).json({ message: "user not found" });
    }

    res.send(200).json({ message: "user reputation decreased successfully" });
  } catch (err) {
    res.send(500).json({ message: "unable to increase user reputation" });
    console.error(err);
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

app.get("/questions/user/:id", async (req, res) => {
  console.log("received request for user questions");

  try {
    const user_id = req.params.id;
    const userQuestions = await Question.find({ user_id: user_id });

    res
      .status(200)
      .json({ message: "found all user questions - sending questions" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "failed to retrieve user questions" });
  }
});

app.get("/questions", async (req, res) => {
  console.log("Received request for questions");
  console.log(req.sort);
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
    let questions;
    if (id) {
      const question = await Question.findOne({ _id: id })
        .populate("answers")
        .populate("tags")
        .populate("asked_by")
        .exec();
      questions = question ? [question] : [];
    } else {
      questions = await Question.find(query)
        .populate("answers")
        .populate("tags")
        .populate("asked_by")
        .exec();
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
    console.log("Sending questions:");

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
      })
        .populate("answers")
        .populate("tags")
        .populate("asked_by")
        .exec();
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
    const foundQuestions = await Question.find(searchQuery)
      .populate("answers")
      .populate("tags")
      .populate("asked_by")
      .exec();
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

app.get("/question/:id/comments", async (req, res) => {
  console.log("received request for comments");

  try {
    const id = req.params.id;
    const comments = await Comment.find({ parent: { $in: id } })
      .populate("created_by")
      .exec();

    res.status(200).json(comments);
    console.log(comments);
  } catch (err) {
    res.status(500).json({ message: "unable to load comments" });
    console.log(err);
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

/**
 
Routes for Question changes
 */

app.put("/question/:id/upvote", async (req, res) => {
  try {
    console.log("updating ");

    const questionId = req.params.id;
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(updatedQuestion);
  } catch (err) {
    res.send(500).json({ message: "Error upvoting - try again" });
    console.error(err);
  }
});

app.put("/question/:id/downvote", async (req, res) => {
  try {
    console.log("updating ");

    const questionId = req.params.id;
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { upvotes: -1 } },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ message: "Error upvoting - try again" });
    console.error(err);
  }
});

app.put("/questions/:id/views", async (req, res) => {
  try {
    console.log("updating ");
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

/**
 * Routes for comments
 */

app.post("/comment", async (req, res) => {
  try {
    const commentDetails = req.body;
    console.log(req.body);
    let parent;
    let newComments;

    const user = await User.findById(commentDetails.userId);
    console.log(user);
    if (commentDetails.parentType === "Question") {
      parent = await Question.findById(commentDetails.parentId);
    }

    if (commentDetails.parentType === "Answer") {
      parent = await Answer.findById(commentDetails.parentId);
    }

    console.log(parent._id);
    console.log(user._id);
    const newComment = new Comment({
      text: commentDetails.text,
      created_by: user._id,
      parent: parent._id,
      parentType: commentDetails.parentType,
    });

    await newComment.save();

    if (commentDetails.parentType === "Question") {
      parent = await Question.findByIdAndUpdate(
        commentDetails.parentId,
        { $push: { comments: newComment._id } },
        { new: true, useFindAndModify: false }
      );

      newComments = await Question.fin;
    }

    if (commentDetails.parentType === "Answer") {
      parent = await Answer.findByIdAndUpdate(
        commentDetails.parentId,
        { $push: { comments: newComment._id } },
        { new: true, useFindAndModify: false }
      );
    }
    res.status(200).json({
      message: "Comment added successfully",
      comment: newComment,
      parent: parent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

app.put("/comment/:id/upvote", async (req, res) => {
  try {
    // Get the comment by id
    let updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvote: 1 } },
      { new: true }
    )
      .populate("created_by")
      .exec();
    if (!updatedComment) {
      res.status(404).send("Comment not found");
      return;
    }
    // Send a success response
    res.status(200).json(updatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
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
