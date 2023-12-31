//Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

const bcrypt = require("bcrypt");
const adminDetails = process.argv.slice(3);
const userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith("mongodb")) {
  console.log(
    "ERROR: You need to specify a valid mongodb URL as the first argument"
  );
  return;
}

const Comment = require("./models/comments");
const Question = require("./models/questions");
const Answer = require("./models/answers");
const Tag = require("./models/tags");
const User = require("./models/user");

const mongoose = require("mongoose");

const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

async function tagCreate(name) {
  const details = {
    name: name,
    used_by: [],
  };
  const tag = new Tag(details);
  return tag.save();
}

async function userCreate(
  user_name,
  email,
  questions,
  answers,
  tags,
  reputation,
  sign_up_date,
  admin,
  password
) {
  const userDetail = {
    user_name: user_name,
    email: email,
    questions: questions,
    answers: answers,
    tags: tags,
    reputation: reputation,
    sign_up_date: sign_up_date,
    password: password,
    comments: [],
  };

  if (admin) {
    userDetail.admin = true;
  }
  const user = new User(userDetail);
  return user.save();
}

async function questionCreate(
  title,
  text,
  summary,
  tags,
  answers,
  comments,
  asked_by,
  ask_date_time,
  views,
  upvotes
) {
  const qstndetail = {
    title: title,
    text: text,
    tags: tags,
    asked_by: asked_by,
    summary: summary,
    comments: comments,
    upvotes: upvotes,
  };
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;

  const qstn = new Question(qstndetail);
  return qstn.save();
}
async function commentCreate(text, created_by, parent, parent_type, upvotes) {
  const commentDetails = {
    text: text,
    created_by: created_by,
    parent: parent,
    parentType: parent_type,
    upvotes: upvotes,
  };
  const comment = new Comment(commentDetails);
  return comment.save();
}
async function answerCreate(
  text,
  ans_by,
  comments,
  ans_date_time,
  upvotes,
  question
) {
  const answerdetail = {
    text: text,
    ans_by: ans_by,
    comments: comments,
    upvotes: upvotes,
    question: question,
  };
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;

  const answer = new Answer(answerdetail);
  return answer.save();
}

const populate = async () => {
  const t1 = await tagCreate("react");
  const t2 = await tagCreate("javascript");
  const t3 = await tagCreate("android");
  const t4 = await tagCreate("mongoose");

  const u1p = await bcrypt.hash("password", 10);
  const u2p = await bcrypt.hash("password", 10);
  const u3p = await bcrypt.hash(adminDetails[1], 10);

  const u1 = await userCreate(
    "sunny",
    "su@gmail.com",
    [],
    [],
    [],
    30,
    new Date(),
    false,
    u1p
  );

  const u2 = await userCreate(
    "jolly",
    "jolluu@gmail.com",
    [],
    [],
    [],
    75,
    new Date(),
    false,
    u2p
  );

  const u3 = await userCreate(
    adminDetails[0],
    "admin@gmail.com",
    [],
    [],
    [],
    100,
    new Date(),
    true,
    u3p
  );

  const q1 = await questionCreate(
    "React router in mongodb application",
    "Does anyone know a good way to route your application using axios, mongoose, and react router? Should I be using switch or route?",
    "Need help routing a React application using React Router",
    [t1, t2],
    [],
    [],
    u2._id,
    false,
    10,
    5
  );

  const q2 = await questionCreate(
    "How do I create a global state in React?",
    "I want to share state across multiple components. Should I use a library or React Context?",
    "Sharing state among multiple components",
    [t1, t3],
    [],
    [],
    u1._id,
    false,
    500,
    50
  );

  const q3 = await questionCreate(
    "Need help using mongoose to update MongoDB database",
    "How do I use mongoose to update a schema, but only certain parts of it?",
    "Updating mongoose and MongoDB schema",
    [t1, t2, t3, t4],
    [],
    [],
    u3._id,
    false,
    5,
    5
  );

  const ans1 = await answerCreate("Answer 1", u1._id, [], false, 10, q1._id);
  const ans2 = await answerCreate("Answer 2", u2._id, [], false, 5, q2._id);

  q2.answers.push(ans2);
  q1.answers.push(ans1);

  await q1.save();
  await q2.save();

  u1.questions.push(q2._id);
  u2.questions.push(q2._id);
  u3.questions.push(q3._id);

  t1.created_by = u1._id;
  t2.created_by = u2._id;
  t3.created_by = u3._id;
  t4.created_by = u3._id;

  u1.tags.push(t1._id);
  u2.tags.push(t2._id);
  u3.tags.push(t3._id);
  u3.tags.push(t4._id);

  u1.answers.push(ans1._id);
  u2.answers.push(ans2._id);

  t1.used_by.push(u1._id);
  t1.used_by.push(u2._id);
  t1.used_by.push(u3._id);

  t2.used_by.push(u2._id);
  t2.used_by.push(u3._id);

  t3.used_by.push(u2._id);
  t3.used_by.push(u3._id);

  await t1.save();
  await t2.save();
  await t3.save();
  await t4.save();

  t2.created_by = u2._id;
  t3.created_by = u3._id;
  t4.created_by = u3._id;

  await u1.save();
  await u2.save();
  await u3.save();

  await t1.save();
  await t2.save();
  await t3.save();
  await t4.save();

  await u1.save();
  await u2.save();
  await u3.save();

  await t1.save();
  await t2.save();
  await t3.save();
  await t4.save();

  const comment1 = await commentCreate(
    "This is helpful",
    u1._id,
    ans1._id,
    "Answer",
    5
  );
  const comment2 = await commentCreate(
    "This has already been asked",
    u3._id,
    q2._id,
    "Question",
    50
  );

  const comment3 = await commentCreate(
    "This has already been asked",
    u3._id,
    q2._id,
    "Question",
    50
  );

  const comment4 = await commentCreate(
    "This has already been asked",
    u3._id,
    q2._id,
    "Question",
    50
  );

  const comment5 = await commentCreate(
    "This has already been asked",
    u3._id,
    q2._id,
    "Question",
    50
  );

  const comment6 = await commentCreate(
    "This has already been asked",
    u3._id,
    q2._id,
    "Question",
    50
  );

  await comment1.save();
  await comment2.save();
  await comment3.save();
  await comment4.save();
  await comment5.save();
  await comment6.save();

  ans1.comments.push(comment1._id);
  q2.comments.push(comment2._id);

  u1.comments.push(comment1._id);
  u2.comments.push(comment2._id);

  await u1.save();
  await u2.save();
  await ans1.save();
  await q2.save();

  console.log(
    `admin details are user: ${adminDetails[0]}, pass: ${adminDetails[1]}`
  );
};

populate()
  .then(() => {
    console.log("Done populating data");
    mongoose.connection.close(); // close the connection here
  })
  .catch((err) => {
    console.log("ERROR: " + err);
    mongoose.connection.close();
  });

console.log("processing ...");
