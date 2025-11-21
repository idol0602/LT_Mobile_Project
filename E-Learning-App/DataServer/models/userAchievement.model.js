const mongoose = require("mongoose");

const UserAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },

    unlockedAt: {
      type: Date,
      default: Date.now,
    },

    notified: {
      type: Boolean,
      default: false, // để biết đã show popup hay chưa
    },

    progress: {
      type: Number,
      default: 100, // lưu % đạt được (nếu 100 = hoàn thành)
    },

    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Mỗi achievement chỉ được unlock 1 lần
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model("UserAchievement", UserAchievementSchema);
