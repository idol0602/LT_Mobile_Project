const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");

// CRUD cho Lesson
router.post("/", lessonController.createLesson);
router.get("/", lessonController.getAllLessons); // Lấy tất cả
router.get("/:id", lessonController.getLessonById);
router.get("/:id/vocabularies", lessonController.getVocabulariesByLessonId);
router.put("/:id", lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);

module.exports = router;
