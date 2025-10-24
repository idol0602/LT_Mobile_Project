// routes/lesson.route.js
const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");

// Định nghĩa các route CRUD cho Lesson
router.post("/add", lessonController.createLesson); // Tạo bài học mới
router.get("/", lessonController.getAllLessons); // Lấy tất cả bài học (có thể thêm query params để lọc)
router.get("/:id", lessonController.getLessonById); // Lấy chi tiết một bài học
router.put("/update/:id", lessonController.updateLesson); // Cập nhật bài học
router.delete("/delete/:id", lessonController.deleteLesson); // Xóa bài học

module.exports = router;
