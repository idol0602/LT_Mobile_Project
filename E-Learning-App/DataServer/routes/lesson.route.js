const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");

// CRUD cho Lesson
router.post("/add", lessonController.createLesson);
router.get("/", lessonController.getAllLessons); // Lấy tất cả
router.get("/:id", lessonController.getLessonById);
router.put("/update/:id", lessonController.updateLesson);
router.delete("/delete/:id", lessonController.deleteLesson);

module.exports = router;
