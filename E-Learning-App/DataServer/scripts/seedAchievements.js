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
    condition: { minLessonsCompleted: 1 },
    difficulty: "easy",
    icon: "🎯",
    hidden: false,
  },
  {
    name: "Week Warrior",
    code: "WEEK_WARRIOR",
    description: "Streak 7 ngày",
    type: "streak",
    condition: { minStreak: 7 },
    difficulty: "normal",
    icon: "🔥",
    hidden: false,
  },
  {
    name: "Marathon Master",
    code: "MARATHON_MASTER",
    description: "Streak 30 ngày",
    type: "streak",
    condition: { minStreak: 30 },
    difficulty: "hard",
    icon: "👑",
    hidden: false,
  },
  {
    name: "Vocabulary Rookie",
    code: "VOCAB_ROOKIE",
    description: "Học 50 từ",
    type: "vocab",
    condition: { minWordsLearned: 50 },
    difficulty: "easy",
    icon: "📚",
    hidden: false,
  },
  {
    name: "Vocabulary Pro",
    code: "VOCAB_PRO",
    description: "Học 200 từ",
    type: "vocab",
    condition: { minWordsLearned: 200 },
    difficulty: "normal",
    icon: "🎓",
    hidden: false,
  },
  {
    name: "Listener Beginner",
    code: "LISTENER_BEGINNER",
    description: "Hoàn thành 5 bài listening",
    type: "progress",
    condition: { minLessonsCompleted: 5, category: "listening" },
    difficulty: "easy",
    icon: "🎧",
    hidden: false,
  },
  {
    name: "Reader Explorer",
    code: "READER_EXPLORER",
    description: "Hoàn thành 10 bài reading",
    type: "progress",
    condition: { minLessonsCompleted: 10, category: "reading" },
    difficulty: "normal",
    icon: "📖",
    hidden: false,
  },
  {
    name: "Grammar Knight",
    code: "GRAMMAR_KNIGHT",
    description: "Hoàn thành 10 bài grammar",
    type: "progress",
    condition: { minLessonsCompleted: 10, category: "grammar" },
    difficulty: "normal",
    icon: "✍️",
    hidden: false,
  },
  {
    name: "Early Bird",
    code: "EARLY_BIRD",
    description: "Học trước 8:00 sáng",
    type: "global",
    condition: { timeBefore: "08:00" }, // tùy bạn xử lý logic
    difficulty: "easy",
    icon: "🌅",
    hidden: false,
  },
  {
    name: "Night Owl",
    code: "NIGHT_OWL",
    description: "Học sau 23:00",
    type: "global",
    condition: { timeAfter: "23:00" },
    difficulty: "easy",
    icon: "🌙",
    hidden: false,
  },
  {
    name: "Consistency Hero",
    code: "CONSISTENCY_HERO",
    description: "Học liên tục 90 ngày",
    type: "streak",
    condition: { minStreak: 90 },
    difficulty: "hard",
    icon: "🔥",
    hidden: false,
  },
  {
    name: "Perfectionist",
    code: "PERFECTIONIST",
    description: "Hoàn thành 1 bài với 100%",
    type: "global",
    condition: { perfectScore: true },
    difficulty: "normal",
    icon: "💯",
    hidden: false,
  },
  {
    name: "Triple Shot",
    code: "TRIPLE_SHOT",
    description: "Học 3 bài trong 1 ngày",
    type: "global",
    condition: { lessonsInOneDay: 3 },
    difficulty: "normal",
    icon: "📌",
    hidden: false,
  },
  {
    name: "Speed Runner",
    code: "SPEED_RUNNER",
    description: "Hoàn thành bài dưới 1 phút",
    type: "global",
    condition: { maxTimeSeconds: 60 },
    difficulty: "hard",
    icon: "⚡",
    hidden: false,
  },
  {
    name: "Collector",
    code: "COLLECTOR",
    description: "Đạt 10 achievements",
    type: "global",
    condition: { minAchievements: 10 },
    difficulty: "normal",
    icon: "🏅",
    hidden: false,
  },
  {
    name: "Master Collector",
    code: "MASTER_COLLECTOR",
    description: "Đạt 50 achievements",
    type: "global",
    condition: { minAchievements: 50 },
    difficulty: "hard",
    icon: "🏆",
    hidden: false,
  },
];

async function seedAchievements() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    for (const achievement of sampleAchievements) {
      const exists = await Achievement.findOne({ code: achievement.code });

      if (!exists) {
        await Achievement.create(achievement);
        console.log(`✅ Created: ${achievement.name}`);
      } else {
        console.log(`⏭️  Skipped (already exists): ${achievement.name}`);
      }
    }

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
    process.exit(1);
  }
}

seedAchievements();
