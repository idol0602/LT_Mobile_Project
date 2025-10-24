// models/topic.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    iconUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
