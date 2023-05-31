var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
  text: { type: String, required: true },
  ans_by: { type: Schema.Types.ObjectId, ref: "User" },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  ans_date_time: { type: Date, default: getRandomDate },
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  upvotes: { type: Number, default: 0 },
});

AnswerSchema.virtual("url").get(function () {
  return `posts/answer/${this._id}`;
});

function getRandomDate() {
  // Generate a random date within a desired range
  var start = new Date(2023, 0, 1); // January 1, 2023
  var end = new Date(); // Current date
  var randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return randomDate;
}

module.exports = mongoose.model("Answer", AnswerSchema);
