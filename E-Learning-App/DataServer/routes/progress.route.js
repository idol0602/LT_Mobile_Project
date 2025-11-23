const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");

// Lấy tiến trình của user
router.get("/:userId", progressController.getUserProgress);

// Lấy thống kê tổng quan
router.get("/:userId/stats", progressController.getProgressStats);

// Lấy danh sách bài học đã hoàn thành
router.get(
  "/:userId/completed-lessons",
  progressController.getCompletedLessons
);

// Đánh dấu lesson hoàn thành
router.post("/:userId/complete-lesson", progressController.completeLesson);

// Cập nhật lesson hiện tại đang học
router.put("/:userId/current-lesson", progressController.updateCurrentLesson);

// Thiết lập lesson hiện tại khi vào trang (không cần progress)
router.put("/:userId/set-current-lesson", progressController.setCurrentLesson);

// Cập nhật tổng số lessons (để tính percent)
router.put("/:userId/total-lessons", progressController.updateTotalLessons);

// App session time tracking
router.post("/:userId/start-app-session", progressController.startAppSession);
router.post("/:userId/end-app-session", progressController.endAppSession);
router.get("/:userId/app-time", progressController.getAppTime);

// Reset progress (testing/admin)
router.delete("/:userId/reset", progressController.resetProgress);

module.exports = router;
