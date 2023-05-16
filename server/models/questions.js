// Question Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  text: { type: String, required: true },
  summary:{type: String, required: true},
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  comments:[{type: Schema.Types.ObjectId, ref: "Comment"}],
  asked_by: { type: String, default: "Anonymous" },
  ask_date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  upvotes: {type:Number, default: 0}
});

QuestionSchema.virtual("url").get(function () {
  return `posts/question/${this._id}`;
});

module.exports = mongoose.model("Question", QuestionSchema);
