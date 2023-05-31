const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: { type: String, required: true },
  created_by: { type: Schema.Types.ObjectId, ref: "User" },
  date_created: { type: Date, default: Date.now() },
  parent: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "parentType",
  },
  parentType: { type: String, required: true, enum: ["Question", "Answer"] },
  upvotes: { type: Number, default: 0 },
});


module.exports = mongoose.model("Comment", commentSchema);
