// scripts/seedAchievements.js

require("dotenv").config();
const mongoose = require("mongoose");
const Achievement = require("../models/achievement.model");

const sampleAchievements = [
  {
    name: "First Step",
    code: "FIRST_STEP",
    description: "Hoàn thành 1 bài học",
    type: "first",
    conditions: [{ key: "totalLessons", operator: ">=", value: 1 }],
    difficulty: "easy",
    icon: "🎯",
    hidden: false,
  },
  {
    name: "Week Warrior",
    code: "WEEK_WARRIOR",
    description: "Streak 7 ngày",
    type: "streak",
    conditions: [{ key: "streak", operator: ">=", value: 7 }],
    difficulty: "normal",
    icon: "🔥",
    hidden: false,
  },
  {
    name: "Marathon Master",
    code: "MARATHON_MASTER",
    description: "Streak 30 ngày",
    type: "streak",
    conditions: [{ key: "streak", operator: ">=", value: 30 }],
    difficulty: "hard",
    icon: "👑",
    hidden: false,
  },
  {
    name: "Vocabulary Rookie",
    code: "VOCAB_ROOKIE",
    description: "Học 50 từ",
    type: "vocab",
    conditions: [{ key: "wordsLearned", operator: ">=", value: 50 }],
    difficulty: "easy",
    icon: "📚",
    hidden: false,
  },
  {
    name: "Vocabulary Pro",
    code: "VOCAB_PRO",
    description: "Học 200 từ",
    type: "vocab",
    conditions: [{ key: "wordsLearned", operator: ">=", value: 200 }],
    difficulty: "normal",
    icon: "🎓",
    hidden: false,
  },
  {
    name: "Listener Beginner",
    code: "LISTENER_BEGINNER",
    description: "Hoàn thành 5 bài listening",
    type: "progress",
    conditions: [
      { key: "totalLessons", operator: ">=", value: 5 },
      { key: "category", operator: "=", value: "listening" },
    ],
    difficulty: "easy",
    icon: "🎧",
    hidden: false,
  },
  {
    name: "Reader Explorer",
    code: "READER_EXPLORER",
    description: "Hoàn thành 10 bài reading",
    type: "progress",
    conditions: [
      { key: "totalLessons", operator: ">=", value: 10 },
      { key: "category", operator: "=", value: "reading" },
    ],
    difficulty: "normal",
    icon: "📖",
    hidden: false,
  },
  {
    name: "Grammar Knight",
    code: "GRAMMAR_KNIGHT",
    description: "Hoàn thành 10 bài grammar",
    type: "progress",
    conditions: [
      { key: "totalLessons", operator: ">=", value: 10 },
      { key: "category", operator: "=", value: "grammar" },
    ],
    difficulty: "normal",
    icon: "✍️",
    hidden: false,
  },
  {
    name: "Early Bird",
    code: "EARLY_BIRD",
    description: "Học trước 8:00 sáng",
    type: "global",
    conditions: [{ key: "timeBefore", operator: "<", value: "08:00" }],
    difficulty: "easy",
    icon: "🌅",
    hidden: false,
  },
  {
    name: "Night Owl",
    code: "NIGHT_OWL",
    description: "Học sau 23:00",
    type: "global",
    conditions: [{ key: "timeAfter", operator: ">", value: "23:00" }],
    difficulty: "easy",
    icon: "🌙",
    hidden: false,
  },
  {
    name: "Consistency Hero",
    code: "CONSISTENCY_HERO",
    description: "Học liên tục 90 ngày",
    type: "streak",
    conditions: [{ key: "streak", operator: ">=", value: 90 }],
    difficulty: "hard",
    icon: "🔥",
    hidden: false,
  },
  {
    name: "Perfectionist",
    code: "PERFECTIONIST",
    description: "Hoàn thành 1 bài với 100%",
    type: "global",
    conditions: [{ key: "lessonScore", operator: "=", value: 100 }],
    difficulty: "normal",
    icon: "💯",
    hidden: false,
  },
  {
    name: "Triple Shot",
    code: "TRIPLE_SHOT",
    description: "Học 3 bài trong 1 ngày",
    type: "global",
    conditions: [{ key: "lessonsInOneDay", operator: ">=", value: 3 }],
    difficulty: "normal",
    icon: "📌",
    hidden: false,
  },
  {
    name: "Speed Runner",
    code: "SPEED_RUNNER",
    description: "Hoàn thành bài dưới 1 phút",
    type: "global",
    conditions: [{ key: "completionTime", operator: "<=", value: 60 }],
    difficulty: "hard",
    icon: "⚡",
    hidden: false,
  },
  {
    name: "Collector",
    code: "COLLECTOR",
    description: "Đạt 10 achievements",
    type: "global",
    conditions: [{ key: "achievementsCount", operator: ">=", value: 10 }],
    difficulty: "normal",
    icon: "🏅",
    hidden: false,
  },
  {
    name: "Master Collector",
    code: "MASTER_COLLECTOR",
    description: "Đạt 50 achievements",
    type: "global",
    conditions: [{ key: "achievementsCount", operator: ">=", value: 50 }],
    difficulty: "hard",
    icon: "🏆",
    hidden: false,
  },
];

async function seedAchievements() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa tất cả achievements cũ
    const deleteResult = await Achievement.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old achievements`);

    // Thêm achievements mới
    const createdAchievements = await Achievement.insertMany(
      sampleAchievements
    );
    console.log(`✅ Created ${createdAchievements.length} new achievements`);

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
    process.exit(1);
  }
}

seedAchievements();
