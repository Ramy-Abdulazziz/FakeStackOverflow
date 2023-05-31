const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: { type: String, required: true },
  created_by: { type: Schema.Types.ObjectId, ref: "User" },
  date_created: { type: Date, default: getRandomDate },
  parent: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "parentType",
  },
  parentType: { type: String, required: true, enum: ["Question", "Answer"] },
  upvotes: { type: Number, default: 0 },
});


function getRandomDate() {
  // Generate a random date within a desired range
  var start = new Date(2023, 0, 1); // January 1, 2023
  var end = new Date(); // Current date
  var randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate;
}
module.exports = mongoose.model("Comment", commentSchema);
