// routes/vocabulary.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const vocabularyController = require("../controllers/vocabularyController");

// Cấu hình Multer để lưu file tạm thời trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET /api/vocabularies -> Lấy tất cả từ
router.get("/", vocabularyController.getAllVocabularies);

// POST /api/vocabularies/add -> Thêm một từ mới
router.post("/add", vocabularyController.addVocabulary);

// POST /api/vocabularies/:id/upload-image -> Upload ảnh cho một từ
router.post(
  "/:id/upload-image",
  upload.single("image"), // 'image' là tên field trong FormData
  vocabularyController.uploadVocabularyImage
);

module.exports = router;
