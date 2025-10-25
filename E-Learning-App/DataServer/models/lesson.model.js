const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    topic: { type: String, required: true },
    type: {
      type: String,
      enum: ["vocab", "listen", "grammar", "reading"],
      required: true,
    },
    vocabularies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vocabulary" }],
    readingContent: String,
    questions: [
      {
        questionText: String,
        options: [String],
        correctAnswerIndex: Number,
      },
    ],
  },
  { timestamps: true, collection: "lessons" }
); // ✅ thêm collection ở đây

module.exports = mongoose.model("Lesson", LessonSchema);
