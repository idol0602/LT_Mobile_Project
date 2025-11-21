const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");

// Lấy tiến trình của user
router.get("/:userId", progressController.getUserProgress);

// Lấy thống kê tổng quan
router.get("/:userId/stats", progressController.getProgressStats);

// Đánh dấu lesson hoàn thành
router.post("/:userId/complete-lesson", progressController.completeLesson);

// Cập nhật lesson hiện tại đang học
router.put("/:userId/current-lesson", progressController.updateCurrentLesson);

// Cập nhật tổng số lessons (để tính percent)
router.put("/:userId/total-lessons", progressController.updateTotalLessons);

// Reset progress (testing/admin)
router.delete("/:userId/reset", progressController.resetProgress);

module.exports = router;
