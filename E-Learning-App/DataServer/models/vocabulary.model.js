// models/vocabulary.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vocabularySchema = new Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    definition: {
      type: String,
      required: true,
      trim: true,
    },
    pronunciation: {
      type: String,
      trim: true,
    },
    partOfSpeech: {
      type: String,
      enum: ["noun", "verb", "adjective", "adverb", "preposition", "other"],
      required: true,
    },
    exampleSentence: {
      type: String,
      trim: true,
    },
    topic: {
      // Đổi tên từ topicId thành topic cho nhất quán với controller
      type: Schema.Types.ObjectId,
      ref: "Topic",
    },
    audioFileId: {
      type: Schema.Types.ObjectId,
      ref: "audios.files",
    },
    imageFileId: {
      type: Schema.Types.ObjectId,
      ref: "images.files",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vocabulary", vocabularySchema);
