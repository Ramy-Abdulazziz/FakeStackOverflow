var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  user_name: { type: String, required: true, maxlength: 50 },
  email: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  reputation: { type: Number, default: 0 },
  sign_up_date: { type: Date, default: new Date() },
  admin: { type: Boolean, default: false },
  password: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("User", userSchema);
