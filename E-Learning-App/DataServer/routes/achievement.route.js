// routes/achievement.route.js
const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievementController");

// ============ ACHIEVEMENT ROUTES ============

/**
 * GET /api/achievements
 * Lấy tất cả achievements
 * Query: ?includeHidden=true (để lấy cả hidden achievements)
 */
router.get("/", achievementController.getAllAchievements);

/**
 * GET /api/achievements/:id
 * Lấy chi tiết một achievement
 */
router.get("/:id", achievementController.getAchievementById);

/**
 * POST /api/achievements
 * Tạo achievement mới (admin only)
 */
router.post("/", achievementController.createAchievement);

/**
 * PUT /api/achievements/:id
 * Cập nhật achievement (admin only)
 */
router.put("/:id", achievementController.updateAchievement);

/**
 * DELETE /api/achievements/:id
 * Xóa achievement (admin only)
 */
router.delete("/:id", achievementController.deleteAchievement);

// ============ USER ACHIEVEMENT ROUTES ============

/**
 * GET /api/achievements/user/:userId
 * Lấy tất cả achievements của user (unlocked + locked)
 */
router.get("/user/:userId", achievementController.getUserAchievements);

/**
 * GET /api/achievements/user/:userId/stats
 * Lấy thống kê achievements của user
 */
router.get(
  "/user/:userId/stats",
  achievementController.getUserAchievementStats
);

/**
 * POST /api/achievements/user/:userId/unlock/:achievementId
 * Unlock achievement cho user
 * Body: { progress: 100, completed: true } (optional)
 */
router.post(
  "/user/:userId/unlock/:achievementId",
  achievementController.unlockAchievement
);

/**
 * PUT /api/achievements/user/:userId/notify/:achievementId
 * Đánh dấu achievement đã được thông báo
 */
router.put(
  "/user/:userId/notify/:achievementId",
  achievementController.markAsNotified
);

/**
 * POST /api/achievements/user/:userId/check
 * Kiểm tra và tự động unlock các achievement đủ điều kiện
 */
router.post(
  "/user/:userId/check",
  achievementController.checkAndUnlockAchievements
);

module.exports = router;
