require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("./models/topic.model");
require("./models/vocabulary.model");
require("./models/lesson.model");
require("./models/user.model");
require("./models/progress.model");
require("./models/achievement.model");
require("./models/userAchievement.model");

const audioRouter = require("./routes/audio");
const vocabularyRouter = require("./routes/vocabulary.route");
const lessonRouter = require("./routes/lesson.route");
const imageRouter = require("./routes/image");
const userRouter = require("./routes/user.route");
const progressRouter = require("./routes/progress.route");
const achievementRouter = require("./routes/achievement.route");

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
//  KIỂM TRA ENV
// =========================
if (!process.env.MONGO_URI) {
  console.error("❌ Lỗi: Biến môi trường MONGO_URI chưa được định nghĩa!");
  process.exit(1);
}

// =========================
//  MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
//  KẾT NỐI MONGODB
// =========================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

const conn = mongoose.connection;

// chạy khi kết nối thành công
conn.once("open", () => {
  console.log("✅ Kết nối MongoDB thành công!");

  const gridfsBucketAudio = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "audios",
  });

  const gridfsBucketImage = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "images",
  });

  // Inject vào request
  app.use((req, res, next) => {
    req.gridfsBucketAudio = gridfsBucketAudio;
    req.gridfsBucketImage = gridfsBucketImage;
    next();
  });

  // =========================
  //   ROUTES
  // =========================
  app.use("/api/audio", audioRouter);
  app.use("/api/vocabularies", vocabularyRouter);
  app.use("/api/lessons", lessonRouter);
  app.use("/api/images", imageRouter);
  app.use("/api/users", userRouter);
  app.use("/api/progress", progressRouter);
  app.use("/api/achievements", achievementRouter);

  // =========================
  //   START SERVER
  // =========================
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server started at http://0.0.0.0:${PORT}`);
  });
});

// log lỗi
conn.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});
