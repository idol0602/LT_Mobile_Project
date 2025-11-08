const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// CRUD cho Lesson
router.post("/", upload.array("audios", 10), lessonController.createLesson);
router.get("/", lessonController.getAllLessons); // Lấy tất cả
router.get("/:id", lessonController.getLessonById);
router.get("/:id/vocabularies", lessonController.getVocabulariesByLessonId);
router.put("/:id", lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);

module.exports = router;
