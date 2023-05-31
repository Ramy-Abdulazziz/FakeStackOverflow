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
    console.log(req.session.id);

    const username = req.body.username;
    const password = req.body.password;

    let user = await User.findOne({ user_name: username }).exec();

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
          user: user,
        });
      } else {
        res.send(401).json({ message: "user does not exist" });
      }
    } else {
      res.send(401).json({ message: "user does not exist" });
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
        return res
          .status(200)
          .json({ message: "guest login successful", userRole: "guest" });
      });
    } else {
      req.session.role = "guest";
      console.log("successful guest login on server side");
      return res
        .status(200)
        .json({ message: "guest login successful", userRole: "guest" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error logging in as guest", err });
  }
});

app.get("/validate-session", async (req, res) => {
  try {
    if (
      req.session &&
      (req.session.role === "user" || req.session.role === "admin")
    ) {
      const id = req.session.userId;
      const user = await User.findById(id);
      res.status(200).json({
        isLoggedIn: true,
        userID: req.session.userId,
        userRole: req.session.role,
        user: user,
        reputation: user.reputation,
        admin: user.admin,
        signup: user.sign_up_date,
        userName: user.user_name,
        email: user.email,
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
      { $inc: { reputation: decrease * -1 } },
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
app.post("/submit/question", async (req, res) => {
  console.log("receiving new question");
  try {
    const questionData = req.body;
    const user = await User.findById(questionData.user);
    const existingTagsPromises = questionData.existingTags.map(
      async (tagName) => {
        const tag = await Tag.findOneAndUpdate(
          { name: tagName },
          { $push: { used_by: user._id } },
          { new: true, useFindAndModify: false }
        );
        return tag; // return the tag here
      }
    );
    const existingTags = await Promise.all(existingTagsPromises);

    const newTagsPromises = questionData.newTags.map(async (tagName) => {
      const tagDetails = {
        name: tagName,
        created_by: user._id,
        used_by: [user._id],
      };

      const newTag = new Tag(tagDetails);
      await newTag.save();
      return newTag; // return the new tag here
    });

    const newTags = await Promise.all(newTagsPromises);

    // Create an array of tag IDs
    const tagIds = [...existingTags, ...newTags].map((tag) => tag._id);

    const newQuestionDetails = {
      title: questionData.title,
      text: questionData.text,
      summary: questionData.summary,
      tags: tagIds,
      asked_by: user._id,
    };
    const newQuestion = new Question(newQuestionDetails);
    await newQuestion.save();

    const updatedUser = await User.findByIdAndUpdate(
      questionData.user,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );
    res
      .status(201)
      .json({ message: "Question added successfully", newQuestion });
  } catch (error) {
    console.error("Error in /submit/question:", error);
    res.status(500).json({ message: "Error adding question", error });
  }
});

app.put("/submit/question/:id/edit", async (req, res) => {
  console.log("receiving new question");
  try {
    const questionData = req.body;
    const qid = req.params.id;
    console.log(qid);
    const user = await User.findById(questionData.user);
    const existingTagsPromises = questionData.existingTags.map(
      async (tagName) => {
        const tag = await Tag.findOneAndUpdate(
          { name: tagName },
          { $push: { used_by: user._id } },
          { new: true, useFindAndModify: false }
        );
        return tag; // return the tag here
      }
    );
    const existingTags = await Promise.all(existingTagsPromises);

    const newTagsPromises = questionData.newTags.map(async (tagName) => {
      const tagDetails = {
        name: tagName,
        created_by: user._id,
        used_by: [user._id],
      };

      const newTag = new Tag(tagDetails);
      await newTag.save();
      return newTag; // return the new tag here
    });

    const newTags = await Promise.all(newTagsPromises);

    // Create an array of tag IDs
    const tagIds = [...existingTags, ...newTags].map((tag) => tag._id);

    const newQuestionDetails = {
      title: questionData.title,
      text: questionData.text,
      summary: questionData.summary,
      tags: tagIds,
      asked_by: user._id,
    };
    const updatedQuestion = await Question.findByIdAndUpdate(
      qid, // get the question id from the request parameters
      {
        $set: newQuestionDetails,
      },
      {
        new: true, // option that asks mongoose to return the updated version of the document instead of the pre-updated one
        runValidators: true, // option that asks mongoose to run the model's validators again, as the data is being updated
      }
    );
    console.log(updatedQuestion);
    res
      .status(200)
      .json({ message: "Question updated successfully", updatedQuestion });
  } catch (error) {
    console.error("Error in /submit/question:", error);
    res.status(500).json({ message: "Error adding question", error });
  }
});

app.delete("/question/:id/delete", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the question
    const question = await Question.findById(id);

    // Store user ID for later use
    const userId = question.asked_by;
    const user = await User.findById(userId);

    // Delete all answers and their comments
    for (let answerId of question.answers) {
      const answer = await Answer.findById(answerId);
      await User.updateMany(
        { answers: { $in: [answerId] } },
        { $pull: { answers: answerId } }
      );
      // Delete all comments of each answer
      for (let commentId of answer.comments) {
        // Remove comment id from user's comments array
        if (user) {
          user.comments.pull(commentId);
          await user.save();
        }
        await User.updateMany(
          { comments: { $in: [commentId] } },
          { $pull: { comments: commentId } }
        );
        await Comment.findByIdAndRemove(commentId);
      }

      await Answer.findByIdAndRemove(answerId);
    }

    // Delete all comments of the question
    for (let commentId of question.comments) {
      // Remove comment id from user's comments array
      if (user) {
        user.comments.pull(commentId);
        await user.save();
      }
      await User.updateMany(
        { comments: { $in: [commentId] } },
        { $pull: { comments: commentId } }
      );
      await Comment.findByIdAndRemove(commentId);
    }

    // For each tag, check if the user is still using the tag in other questions
    for (let tagId of question.tags) {
      const tag = await Tag.findById(tagId);
      // Get all questions of the user
      const userQuestions = await Question.find({ asked_by: user._id });
      // Check if the user is still using the tag in other questions
      const isTagUsedByUser = userQuestions.some(
        (q) => q._id.toString() !== id && q.tags.includes(tagId)
      );

      if (!isTagUsedByUser) {
        // If not, remove the user's ID from the tag's `used_by` field
        const index = tag.used_by.indexOf(userId);
        console.log("removing user");
        if (index > -1) {
          tag.used_by.splice(index, 1);
          await tag.save();
        }
      }
    }
    await User.updateMany(
      { questions: { $in: [question._id] } },
      { $pull: { questions: question._id } }
    );

    // Finally, delete the question itself
    await Question.findByIdAndRemove(id);

    res
      .status(200)
      .json({ message: "Question and all related data deleted successfully" });
  } catch (error) {
    console.error("Error in /question/:id/delete:", error);
    res.status(500).json({ message: "Error deleting question", error });
  }
});

app.post("/submit/:id/answer", async (req, res) => {
  console.log("receiving answer for question");
  try {
    const id = req.params.id;
    const data = req.body;

    const user = await User.findById(data.user);

    const answerData = {
      text: data.text,
      ans_by: user._id,
      ans_date_time: new Date(),
      question: data.question,
    };

    const newAnswer = new Answer(answerData);
    await newAnswer.save();

    const userData = await User.findByIdAndUpdate(
      data.user,
      { $push: { answers: newAnswer._id } },
      { new: true, useFindAndModify: false }
    ).exec();

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
    const userQuestions = await Question.find({ asked_by: user_id })
      .populate("tags")
      .populate("asked_by")
      .exec();

    res.status(200).json(userQuestions);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "failed to retrieve user questions" });
  }
});

app.get("/questions/answered/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate({
        path: "answers",
        populate: {
          path: "question",
          model: "Question",
          populate: [
            { path: "answers", model: "Answer" },
            { path: "tags", model: "Tag" },
            { path: "asked_by", model: "User" },
          ],
        },
      })
      .exec();
    const questions = user.answers.map((answer) => answer.question);
    questions.forEach((question) => {
      // Sort the answers array so that the user's answer is first and the rest are sorted by date
      question.answers.sort((a, b) => {
        if (a.ans_by.toString() === userId && b.ans_by.toString() === userId) {
          return b.ans_date_time - a.ans_date_time; // descending order by date for user's answers
        } else if (a.ans_by.toString() === userId) {
          return -1;
        } else if (b.ans_by.toString() === userId) {
          return 1;
        } else {
          return b.ans_date_time - a.ans_date_time; // descending order by date for other users' answers
        }
      });
    });

    res.status(200).json(questions);
  } catch (err) {
    console.log(err);
    res.status(500);
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

    if (tagName) {
      const tag = await Tag.findOne({ name: tagName });

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
        .populate("tags.created_by")
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
  switch (searchBy) {
    case "text_and_title":
      const regexTextAndTitle = new RegExp(searchText, "i");
      searchQuery = {
        $or: [{ text: regexTextAndTitle }, { title: regexTextAndTitle }],
      };
      break;
    case "tags":
      const tag = await Tag.findOne({ name: searchText });
      // Check if the tag exists
      if (tag) {
        searchQuery = { tags: { $in: [tag._id] } };
      } else {
        // If the tag doesn't exist, return an empty array
        return res.json([]);
      }
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
  try {
    const id = req.params.id;
    const comments = await Comment.find({ parent: { $in: id } })
      .populate("created_by")
      .exec();

    res
      .status(200)
      .json(comments.sort((a, b) => b.date_created - a.date_created));
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
    res.status(500).send("Error retrieving tags");
  }
});

app.get("/tags/:id/name", async (req, res) => {
  try {
    const tagId = req.params.id;
    const tag = await Tag.findById(tagId);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
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
 *
 * Routes for
 */

app.get("/user/tags/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const tags = await Tag.find({ created_by: { $in: userId } })
      .populate("created_by")
      .populate("used_by")
      .exec();

    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json({ message: "system error" });
  }
});

app.get("/tags/:name/usedby", async (req, res) => {
  try {
    const tag = await Tag.findOne({ name: req.params.name });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (tag.used_by.length <= 1) {
      return res
        .status(200)
        .json({ message: "Tag is not being used by other users" });
    } else {
      return res
        .status(403)
        .json({ message: "Tag is not being used by other users" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.put("/tags/edit/:tagName", async (req, res) => {
  try {
    const { tagName } = req.params;
    const { newTagName } = req.body; // Assuming new tag name is passed in the request body

    // Find the tag with the provided name
    const tag = await Tag.findOne({ name: tagName });

    // If no such tag exists, return an error
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Update the name of the tag
    tag.name = newTagName;

    // Save the updated tag
    await tag.save();

    // Respond with the updated tag
    res.status(200).json(tag);
  } catch (err) {
    // Handle any potential errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/tags/delete/:tagName", async (req, res) => {
  try {
    const { tagName } = req.params;

    // Find the tag with the provided name
    const tag = await Tag.findOne({ name: tagName });

    // If no such tag exists, return an error
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Remove the tagId from any question that is using it
    await Question.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });

    // Delete the tag
    await Tag.findByIdAndRemove(tag._id);

    // Respond with a success message
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    // Handle any potential errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 
Routes for Question changes
 */

app.put("/question/:id/upvote", async (req, res) => {
  try {
    const questionId = req.params.id;

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    const updated = await User.findByIdAndUpdate(
      updatedQuestion.asked_by,
      { $inc: { reputation: 5 } },
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
    const questionId = req.params.id;
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { upvotes: -1 } },
      { new: true }
    );

    const updatedUser = await User.findByIdAndUpdate(
      updatedQuestion.asked_by,
      { $inc: { reputation: -10 } },
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
    let parent;
    let newComments;

    const user = await User.findById(commentDetails.userId);
    if (commentDetails.parentType === "Question") {
      parent = await Question.findById(commentDetails.parentId);
    }

    if (commentDetails.parentType === "Answer") {
      parent = await Answer.findById(commentDetails.parentId);
    }

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
      comment: newComment.populate("created_by"),
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
      { $inc: { upvotes: 1 } },
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

/**
 * Routes for answers
 */

app.get("/answer/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const answer = await Answer.findById(id)
      .populate("comments")
      .populate("ans_by")
      .exec();

    if (answer) {
      res.status(200).json(answer);
    } else {
      res.status(404).json({ message: "answer not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "System error" });
  }
});

app.get("/answer/:id/comments", async (req, res) => {
  try {
    const id = req.params.id;
    const comments = await Comment.find({ parent: { $in: id } })
      .populate("created_by")
      .exec();

    res
      .status(200)
      .json(comments.sort((a, b) => b.date_created - a.date_created));
  } catch (err) {
    res.status(500).json({ message: "system error" });
  }
});

app.put("/answer/:id/upvote", async (req, res) => {
  try {
    // Get the comment by id
    let updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    )
      .populate("comments")
      .populate("ans_by")
      .exec();
    let oldAnswer = await Answer.findById(req.params.id);

    const updatedUser = await User.findByIdAndUpdate(
      oldAnswer.asked_by,
      { $inc: { reputation: 5 } },
      { new: true }
    );

    if (!updatedAnswer) {
      res.status(404).send("Comment not found");
      return;
    }
    // Send a success response
    res.status(200).json(updatedAnswer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.put("/answer/:id/downvote", async (req, res) => {
  try {
    // Get the comment by id
    let updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: -1 } },
      { new: true }
    )
      .populate("comments")
      .populate("ans_by")
      .exec();
    let oldAnswer = await Answer.findById(req.params.id);

    const updatedUser = await User.findByIdAndUpdate(
      oldAnswer.asked_by,
      { $inc: { reputation: -10 } },
      { new: true }
    );

    if (!updatedAnswer) {
      res.status(404).send("Comment not found");
      return;
    }
    // Send a success response
    res.status(200).json(updatedAnswer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.delete("/answer/:id", async (req, res) => {
  try {
    // Fetch the answer by its id
    let answer = await Answer.findById(req.params.id);

    // Check if answer exists
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Fetch the associated user
    let user = await User.findById(answer.ans_by);

    // Delete associated comments
    for (let commentId of answer.comments) {
      // Remove comment id from user's comments array
      if (user) {
        user.comments.pull(commentId);
        await user.save();
      }
      await Comment.findByIdAndRemove(commentId);
    }

    // Fetch the associated question
    let question = await Question.findOne({ answers: req.params.id });

    // Remove answer id from question's answers array
    if (question) {
      question.answers.pull(req.params.id);
      await question.save();
    }

    // Remove answer id from user's answers array
    if (user) {
      user.answers.pull(req.params.id);
      await user.save();
    }

    // Delete the answer itself
    await Answer.findByIdAndRemove(req.params.id);

    // Send response
    res.status(200).json({ message: "Answer and associated comments deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/answer/:id", async (req, res) => {
  try {
    // Fetch the answer by its id
    let answer = await Answer.findById(req.params.id);

    // Check if answer exists
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Update answer text
    answer = await Answer.findByIdAndUpdate(req.params.id, {
      text: req.body.text,
    });
    await answer.save();

    // Populate the 'ans_by' field
    answer = await Answer.findById(req.params.id).populate("ans_by");

    // Send response
    res.status(200).json({ message: "Answer updated", answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/:id/users", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    console.log("found user");
    console.log(user);
    const users = await User.find({ _id: { $ne: user._id } });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.delete("/admin/:id/delete", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    // Fetch user's questions, answers and comments
    const userQuestions = await Question.find({ asked_by: user._id });
    const userAnswers = await Answer.find({ ans_by: user._id });
    const userComments = await Comment.find({ created_by: user._id });
    console.log(userQuestions);
    // Delete all questions, their answers and comments
    for (let question of userQuestions) {
      // Delete all comments of the question
      for (let commentId of question.comments) {
        await User.updateMany(
          { comments: { $in: [commentId] } },
          { $pull: { comments: commentId } }
        );
        await Comment.findByIdAndRemove(commentId);
      }
      console.log("deleting answers");
      // Delete all answers and their comments
      console.log(question.answers);
      for (let answerId of question.answers) {
        const answer = await Answer.findById(answerId);

        await User.updateMany(
          { answers: { $in: [answerId] } },
          { $pull: { answers: answerId } }
        );

        // Delete all comments of the answer
        for (let commentId of answer.comments) {
          await User.updateMany(
            { comments: { $in: [commentId] } },
            { $pull: { comments: commentId } }
          );
          await Comment.findByIdAndRemove(commentId);
        }
        // Remove the answer from the user who answered it
        const answeredByUser = await User.findById(answer.ans_by);
        if (answeredByUser) {
          answeredByUser.answers.pull(answer._id);
          await answeredByUser.save();
        } else {
          console.error(`No user found with id ${answer.ans_by}`);
        }

        await Question.updateMany(
          { answers: { $in: [answerId] } },
          { $pull: { answers: answerId } }
        );
        // Delete the answer itself
        await Answer.findByIdAndRemove(answer._id);
      }

      await User.updateMany(
        { questions: { $in: [question._id] } },
        { $pull: { questions: question._id } }
      );

      // Delete the question itself
      await Question.findByIdAndRemove(question._id);
    }

    // Delete all answers and their comments
    for (let answer of userAnswers) {
      // Delete all comments of the answer
      for (let commentId of answer.comments) {
        await User.updateMany(
          { comments: { $in: [commentId] } },
          { $pull: { comments: commentId } }
        );
        await Comment.findByIdAndRemove(commentId);
      }
      await Question.updateMany(
        { answers: { $in: [answer._id] } },
        { $pull: { answers: answer._id } }
      );
      // Delete the answer itself
      await Answer.findByIdAndRemove(answer._id);
    }

    // Delete all user's comments
    for (let comment of userComments) {
      // Remove the comment from the corresponding question or answer
      console.log(comment);
      const commentedEntity =
        comment.parentType === "Question"
          ? await Question.findById(comment.parent)
          : await Answer.findById(comment.parent);
      console.log(commentedEntity);
      if (commentedEntity) {
        commentedEntity.comments.pull(comment._id);
        await commentedEntity.save();
      }
      // Delete the comment itself
      await Comment.findByIdAndRemove(comment._id);
    }

    // For each tag, remove the user's ID from the tag's `used_by` field
    const tags = await Tag.find({ used_by: { $in: [user._id] } });
    for (let tag of tags) {
      tag.used_by.pull(user._id);
      await tag.save();
    }

    // Finally, delete the user
    await User.findByIdAndRemove(userId);

    res
      .status(200)
      .json({ message: "User and all related data deleted successfully" });
  } catch (error) {
    console.error("Error in /admin/:id/delete:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
});

app.get("/admin/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
});

// Handle server termination
process.on("SIGINT", function () {
  db.close(() => {
    console.log("Server closed. Database instance disconnected");
    process.exit(0);
  });
});
