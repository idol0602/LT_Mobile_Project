const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    reading: {
      data: [String],
      completedPercent: { type: Number, default: 0 },
    },

    vocab: {
      data: [String],
      wordsLearned: { type: Number, default: 0 },
      completedPercent: { type: Number, default: 0 },
    },

    listening: {
      data: [String],
      completedPercent: { type: Number, default: 0 },
    },

    grammar: {
      data: [String],
      completedPercent: { type: Number, default: 0 },
    },

    // Detailed completed lessons tracking
    completedLessons: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        category: String,
        score: Number,
        completionTime: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],

    currentLesson: {
      lessonId: String,
      category: String,
      progress: Number,
    },

    streak: { type: Number, default: 0 },
    lastStudyDate: { type: Date },

    // Achievement-related tracking
    lastLessonScore: { type: Number, default: 0 }, // Điểm bài học vừa hoàn thành
    lastCategory: { type: String }, // Category của bài học vừa hoàn thành
    lessonsToday: { type: Number, default: 0 }, // Số bài đã học trong ngày
    lastCompletionTime: { type: Number, default: 0 }, // Thời gian hoàn thành bài (giây)
    achievementsUnlocked: { type: Number, default: 0 }, // Tổng số achievements đã unlock

    // App session time tracking
    totalAppTime: { type: Number, default: 0 }, // Tổng thời gian truy cập app (giây)
    lastAppSessionStart: { type: Date }, // Thời điểm bắt đầu session app hiện tại

    totalLessons: {
      reading: Number,
      vocab: Number,
      listening: Number,
      grammar: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProgress", UserProgressSchema);
