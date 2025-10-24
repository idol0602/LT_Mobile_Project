// routes/vocabulary.js
const express = require("express");
const router = express.Router();
const multer = require("multer"); // 1. Đảm bảo đã import multer
const vocabularyController = require("../controllers/vocabularyController");

// 2. Cấu hình Multer để lưu file tạm thời trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// === CÁC ROUTE KHÁC ===
// GET /api/vocabularies -> Lấy tất cả từ
router.get("/", vocabularyController.getAllVocabularies);
router.get("/:id", vocabularyController.getVocabularyById);
router.post("/many", vocabularyController.getVocabulariesByIds);

// === ROUTE CẦN SỬA ===
// POST /api/vocabularies/add -> Thêm một từ mới
// 3. Đặt middleware của Multer vào ĐÚNG route này
router.post(
  "/add",
  // Middleware này sẽ đọc FormData, tìm file có field name 'image'
  upload.single("image"),
  // Sau khi Multer chạy xong, nó mới gọi đến controller
  vocabularyController.addVocabulary
);
router.put(
  "/update/:id",
  upload.single("image"), // Dùng single vì chỉ update ảnh
  vocabularyController.updateVocabulary
);

router.delete("/delete/:id", vocabularyController.deleteVocabulary);
// (Bạn có thể thêm các route cho update và delete ở đây sau)
router.get("/stats", vocabularyController.getVocabularyStats);
module.exports = router;
