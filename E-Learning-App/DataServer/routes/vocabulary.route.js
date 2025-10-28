// routes/vocabulary.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const vocabularyController = require("../controllers/vocabularyController");

// --- Cấu hình Multer để lưu file vào bộ nhớ (RAM) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ======================
// ⚙️ ROUTE TĨNH (Thống kê)
// ======================
router.get("/stats", vocabularyController.getVocabularyStats);

router.get("/", vocabularyController.getAllVocabularies);

// Lấy chi tiết 1 từ theo ID
router.get("/:id", vocabularyController.getVocabularyById);

// Lấy nhiều từ theo danh sách ID
router.post("/many", vocabularyController.getVocabulariesByIds);

// ======================
// ✳️ ROUTE THÊM / CẬP NHẬT / XOÁ
// ======================

// Thêm một từ vựng mới (có thể kèm ảnh)
router.post("/", upload.single("image"), vocabularyController.addVocabulary);

// Cập nhật một từ vựng
router.put(
  "/:id",
  upload.single("image"),
  vocabularyController.updateVocabulary
);

// Xoá một từ vựng
router.delete("/:id", vocabularyController.deleteVocabulary);
// --- THÊM ROUTE MỚI ĐỂ IMPORT ---
// Dùng upload.single('file') để nhận 1 file có tên field là 'file'
router.post(
  "/import",
  upload.single("file"),
  vocabularyController.importVocabularies
);

module.exports = router;
