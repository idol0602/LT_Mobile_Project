require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
require("./models/topic.model");
require("./models/vocabulary.model");

const audioRouter = require("./routes/audio");
const vocabularyRouter = require("./routes/vocabulary");
const imageRouter = require("./routes/image");
const router = require("./routes/index");
const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error(" Lỗi: Biến môi trường MONGO_URI không được định nghĩa.");
  process.exit(1);
}
const mongoURI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;
let gfs, gridfsBucketAudio;
let gridfsBucketImage;
// Khởi tạo GridFS và bắt đầu lắng nghe server khi kết nối DB thành công
conn.once("open", () => {
  console.log("✅ Kết nối MongoDB thành công!");

  // Khởi tạo GridFS Bucket (Dùng cho stream và upload/download file)
  gridfsBucketAudio = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "audios",
  });
  gridfsBucketImage = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "images",
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("audios");

  app.use((req, res, next) => {
    req.gridfsBucketAudio = gridfsBucketAudio;
    req.gridfsBucketImage = gridfsBucketImage;
    next();
  });

  app.use("/api/audio", audioRouter);
  app.use("/api/vocabularies", vocabularyRouter);
  app.use("/api/images", imageRouter);
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  router(app);

  app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
});

conn.on("error", (err) => {
  console.error("❌ Lỗi kết nối MongoDB:", err);
});
