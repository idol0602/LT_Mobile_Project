const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// CRUD cho Lesson
router.post("/", upload.array("audios", 10), lessonController.createLesson);
router.get("/", lessonController.getAllLessons); // Lấy tất cả (có phân trang)
router.get("/stats/count-by-type", lessonController.getLessonCountByType); // 📊 Thống kê số lượng theo type
router.get("/type/:type", lessonController.getLessonsByType); // Lấy tất cả theo type (không phân trang)
router.get("/:id", lessonController.getLessonById);
router.get("/:id/vocabularies", lessonController.getVocabulariesByLessonId);
router.put("/:id", upload.array("audios", 10), lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);

module.exports = router;
