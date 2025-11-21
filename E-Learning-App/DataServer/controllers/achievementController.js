// controllers/achievementController.js
const Achievement = require("../models/achievement.model");
const UserAchievement = require("../models/userAchievement.model");
const UserProgress = require("../models/progress.model");

/**
 * GET /api/achievements
 * Lấy tất cả achievements (admin hoặc public)
 */
exports.getAllAchievements = async (req, res) => {
  try {
    const { includeHidden } = req.query;

    const filter = includeHidden === "true" ? {} : { hidden: false };
    const achievements = await Achievement.find(filter).sort({
      difficulty: 1,
      createdAt: 1,
    });

    res.json({
      success: true,
      data: achievements,
      count: achievements.length,
    });
  } catch (error) {
    console.error("Error getting achievements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get achievements",
      error: error.message,
    });
  }
};

/**
 * GET /api/achievements/:id
 * Lấy chi tiết một achievement
 */
exports.getAchievementById = async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findById(id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    res.json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    console.error("Error getting achievement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get achievement",
      error: error.message,
    });
  }
};

/**
 * POST /api/achievements
 * Tạo achievement mới (admin only)
 */
exports.createAchievement = async (req, res) => {
  try {
    const achievementData = req.body;
    const achievement = await Achievement.create(achievementData);

    res.status(201).json({
      success: true,
      message: "Achievement created successfully",
      data: achievement,
    });
  } catch (error) {
    console.error("Error creating achievement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create achievement",
      error: error.message,
    });
  }
};

/**
 * PUT /api/achievements/:id
 * Cập nhật achievement (admin only)
 */
exports.updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const achievement = await Achievement.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    res.json({
      success: true,
      message: "Achievement updated successfully",
      data: achievement,
    });
  } catch (error) {
    console.error("Error updating achievement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update achievement",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/achievements/:id
 * Xóa achievement (admin only)
 */
exports.deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findByIdAndDelete(id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Xóa tất cả user achievements liên quan
    await UserAchievement.deleteMany({ achievementId: id });

    res.json({
      success: true,
      message: "Achievement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete achievement",
      error: error.message,
    });
  }
};

/**
 * GET /api/achievements/user/:userId
 * Lấy tất cả achievements của user (đã unlock + chưa unlock)
 */
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy tất cả achievements
    const allAchievements = await Achievement.find({ hidden: false }).sort({
      difficulty: 1,
      createdAt: 1,
    });

    // Lấy achievements đã unlock của user
    const userAchievements = await UserAchievement.find({ userId }).populate(
      "achievementId"
    );

    // Map achievements với trạng thái unlock
    const achievementsWithStatus = allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementId._id.toString() === achievement._id.toString()
      );

      return {
        achievement: achievement.toObject(), // Wrap trong field 'achievement'
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null,
        progress: userAchievement?.progress || 0,
      };
    });

    res.json({
      success: true,
      data: achievementsWithStatus,
      totalAchievements: allAchievements.length,
      unlockedCount: userAchievements.length,
    });
  } catch (error) {
    console.error("Error getting user achievements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user achievements",
      error: error.message,
    });
  }
};

/**
 * POST /api/achievements/user/:userId/unlock/:achievementId
 * Unlock achievement cho user
 */
exports.unlockAchievement = async (req, res) => {
  try {
    const { userId, achievementId } = req.params;
    const { progress = 100, completed = true } = req.body;

    // Kiểm tra achievement có tồn tại
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Kiểm tra đã unlock chưa
    let userAchievement = await UserAchievement.findOne({
      userId,
      achievementId,
    });

    if (userAchievement) {
      return res.status(400).json({
        success: false,
        message: "Achievement already unlocked",
        data: userAchievement,
      });
    }

    // Unlock achievement
    userAchievement = await UserAchievement.create({
      userId,
      achievementId,
      progress,
      completed,
      notified: false,
    });

    await userAchievement.populate("achievementId");

    res.status(201).json({
      success: true,
      message: "Achievement unlocked successfully",
      data: userAchievement,
    });
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlock achievement",
      error: error.message,
    });
  }
};

/**
 * PUT /api/achievements/user/:userId/notify/:achievementId
 * Đánh dấu achievement đã được thông báo
 */
exports.markAsNotified = async (req, res) => {
  try {
    const { userId, achievementId } = req.params;

    const userAchievement = await UserAchievement.findOneAndUpdate(
      { userId, achievementId },
      { notified: true },
      { new: true }
    ).populate("achievementId");

    if (!userAchievement) {
      return res.status(404).json({
        success: false,
        message: "User achievement not found",
      });
    }

    res.json({
      success: true,
      message: "Achievement marked as notified",
      data: userAchievement,
    });
  } catch (error) {
    console.error("Error marking achievement as notified:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark achievement as notified",
      error: error.message,
    });
  }
};

/**
 * POST /api/achievements/user/:userId/check
 * Kiểm tra và unlock các achievement đủ điều kiện
 */
exports.checkAndUnlockAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy progress của user
    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "User progress not found",
      });
    }

    // Lấy tất cả achievements
    const allAchievements = await Achievement.find({});

    // Lấy achievements đã unlock
    const unlockedIds = (await UserAchievement.find({ userId })).map((ua) =>
      ua.achievementId.toString()
    );

    const newlyUnlocked = [];

    // Kiểm tra từng achievement
    for (const achievement of allAchievements) {
      // Skip nếu đã unlock
      if (unlockedIds.includes(achievement._id.toString())) {
        continue;
      }

      let shouldUnlock = false;

      // Kiểm tra điều kiện
      const condition = achievement.condition || {};

      // Check streak
      if (condition.minStreak && userProgress.streak >= condition.minStreak) {
        shouldUnlock = true;
      }

      // Check total lessons
      if (condition.minLessonsCompleted) {
        const totalCompleted =
          (userProgress.reading?.data?.length || 0) +
          (userProgress.vocab?.data?.length || 0) +
          (userProgress.listening?.data?.length || 0) +
          (userProgress.grammar?.data?.length || 0);

        if (totalCompleted >= condition.minLessonsCompleted) {
          shouldUnlock = true;
        }
      }

      // Check words learned (vocab)
      if (
        condition.minWordsLearned &&
        userProgress.vocab?.wordsLearned >= condition.minWordsLearned
      ) {
        shouldUnlock = true;
      }

      // Check category-specific
      if (condition.category && condition.minLessonsCompleted) {
        const categoryProgress = userProgress[condition.category];
        if (categoryProgress?.data?.length >= condition.minLessonsCompleted) {
          shouldUnlock = true;
        }
      }

      // Unlock nếu đủ điều kiện
      if (shouldUnlock) {
        const userAchievement = await UserAchievement.create({
          userId,
          achievementId: achievement._id,
          progress: 100,
          completed: true,
          notified: false,
        });

        newlyUnlocked.push({
          ...achievement.toObject(),
          unlockedAt: userAchievement.unlockedAt,
        });
      }
    }

    res.json({
      success: true,
      message: `Checked achievements, ${newlyUnlocked.length} newly unlocked`,
      data: {
        newlyUnlocked: newlyUnlocked,
      },
      count: newlyUnlocked.length,
    });
  } catch (error) {
    console.error("Error checking achievements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check achievements",
      error: error.message,
    });
  }
};

/**
 * GET /api/achievements/user/:userId/stats
 * Lấy thống kê achievements của user
 */
exports.getUserAchievementStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const totalAchievements = await Achievement.countDocuments({
      hidden: false,
    });
    const unlockedAchievements = await UserAchievement.countDocuments({
      userId,
    });

    const recentUnlocked = await UserAchievement.find({ userId })
      .sort({ unlockedAt: -1 })
      .limit(5)
      .populate("achievementId");

    res.json({
      success: true,
      data: {
        totalAchievements,
        unlockedAchievements,
        completionRate: totalAchievements
          ? Math.round((unlockedAchievements / totalAchievements) * 100)
          : 0,
        recentUnlocked,
      },
    });
  } catch (error) {
    console.error("Error getting achievement stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get achievement stats",
      error: error.message,
    });
  }
};
