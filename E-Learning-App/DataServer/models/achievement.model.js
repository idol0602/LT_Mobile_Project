const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      unique: true, // ví dụ: FIRST_STEP, WEEK_WARRIOR
    },

    description: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["progress", "vocab", "streak", "global", "first"],
      required: true,
    },

    condition: {
      minLessonsCompleted: { type: Number },
      minWordsLearned: { type: Number },
      minStreak: { type: Number },
      category: { type: String }, // reading, vocab, listening...
    },

    difficulty: {
      type: String,
      enum: ["easy", "normal", "hard"],
      default: "easy",
    },
    icon: {
      type: String, // URL icon
    },

    hidden: {
      type: Boolean,
      default: false, // nếu true → chỉ hiện khi user unlock
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achievement", AchievementSchema);
