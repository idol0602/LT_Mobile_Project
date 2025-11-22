// controllers/achievementController.js
const Achievement = require("../models/achievement.model");
const UserAchievement = require("../models/userAchievement.model");
const UserProgress = require("../models/progress.model");

// Valid condition keys and operators
const VALID_CONDITION_KEYS = [
  "totalLessons",
  "wordsLearned",
  "streak",
  "lessonScore",
  "lessonsInOneDay",
  "completionTime",
  "achievementsCount",
  "category",
  "timeBefore",
  "timeAfter",
];

const VALID_OPERATORS = ["=", ">=", "<=", ">", "<", "in", "contains"];

/**
 * Validate achievement conditions
 */
function validateConditions(conditions) {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return { valid: false, error: "Conditions must be a non-empty array" };
  }

  for (let i = 0; i < conditions.length; i++) {
    const { key, operator, value } = conditions[i];

    if (!key || !operator) {
      return {
        valid: false,
        error: `Condition ${i + 1}: 'key' and 'operator' are required`,
      };
    }

    if (!VALID_CONDITION_KEYS.includes(key)) {
      return {
        valid: false,
        error: `Condition ${
          i + 1
        }: Invalid key '${key}'. Valid keys: ${VALID_CONDITION_KEYS.join(
          ", "
        )}`,
      };
    }

    if (!VALID_OPERATORS.includes(operator)) {
      return {
        valid: false,
        error: `Condition ${
          i + 1
        }: Invalid operator '${operator}'. Valid operators: ${VALID_OPERATORS.join(
          ", "
        )}`,
      };
    }

    if (value === undefined || value === null) {
      return {
        valid: false,
        error: `Condition ${i + 1}: 'value' is required`,
      };
    }
  }

  return { valid: true };
}

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
 * GET /api/achievements/metadata
 * Lấy metadata cho achievement (valid keys, operators)
 */
exports.getAchievementMetadata = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        validKeys: VALID_CONDITION_KEYS.map((key) => ({
          value: key,
          label: key,
          description: getKeyDescription(key),
        })),
        validOperators: VALID_OPERATORS.map((op) => ({
          value: op,
          label: op,
          description: getOperatorDescription(op),
        })),
      },
    });
  } catch (error) {
    console.error("Error getting achievement metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get achievement metadata",
      error: error.message,
    });
  }
};

function getKeyDescription(key) {
  const descriptions = {
    totalLessons: "Total lessons completed (all categories)",
    wordsLearned: "Total vocabulary words learned",
    streak: "Current learning streak (consecutive days)",
    lessonScore: "Score of the last completed lesson (0-100)",
    lessonsInOneDay: "Number of lessons completed today",
    completionTime: "Time taken to complete last lesson (seconds)",
    achievementsCount: "Total achievements unlocked",
    category: "Specific lesson category (reading, vocab, listening, grammar)",
    timeBefore: "Time before certain hour (HH:MM format)",
    timeAfter: "Time after certain hour (HH:MM format)",
  };
  return descriptions[key] || "";
}

function getOperatorDescription(operator) {
  const descriptions = {
    "=": "Equal to",
    ">=": "Greater than or equal to",
    "<=": "Less than or equal to",
    ">": "Greater than",
    "<": "Less than",
    in: "Value is in array",
    contains: "Array contains value",
  };
  return descriptions[operator] || "";
}

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

    // Validate conditions
    if (achievementData.conditions) {
      const validation = validateConditions(achievementData.conditions);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }
    }

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

    // Validate conditions if provided
    if (updateData.conditions) {
      const validation = validateConditions(updateData.conditions);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }
    }

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
/**
 * Helper function to evaluate a single condition
 */
function evaluateCondition(condition, userProgress, userStats) {
  const { key, operator, value } = condition;
  let currentValue;

  // Get current value based on key
  switch (key) {
    case "totalLessons":
      currentValue =
        (userProgress.reading?.data?.length || 0) +
        (userProgress.vocab?.data?.length || 0) +
        (userProgress.listening?.data?.length || 0) +
        (userProgress.grammar?.data?.length || 0);
      break;
    case "wordsLearned":
      currentValue = userProgress.vocab?.wordsLearned || 0;
      break;
    case "streak":
      currentValue = userProgress.streak || 0;
      break;
    case "lessonScore":
      currentValue = userProgress.lastLessonScore || 0;
      break;
    case "lessonsInOneDay":
      currentValue = userProgress.lessonsToday || 0;
      break;
    case "completionTime":
      currentValue = userProgress.lastCompletionTime || 0;
      break;
    case "achievementsCount":
      currentValue = userProgress.achievementsUnlocked || 0;
      break;
    case "timeBefore":
    case "timeAfter":
      // Time-based conditions need special handling
      // For now, return false (can be implemented later)
      return false;
    case "category":
      // For category, we need to check if lessons exist in that category
      const categoryData = userProgress[value]?.data?.length || 0;
      return categoryData > 0; // Return true if any lesson completed in this category
    default:
      console.warn(`Unknown condition key: ${key}`);
      return false;
  }

  // Evaluate based on operator
  switch (operator) {
    case ">=":
      return currentValue >= value;
    case "<=":
      return currentValue <= value;
    case ">":
      return currentValue > value;
    case "<":
      return currentValue < value;
    case "=":
      return currentValue === value;
    case "in":
      return Array.isArray(value) && value.includes(currentValue);
    case "contains":
      return Array.isArray(currentValue) && currentValue.includes(value);
    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

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

      // Kiểm tra tất cả conditions (AND logic)
      const conditions = achievement.conditions || [];
      if (conditions.length === 0) {
        continue; // Skip achievement without conditions
      }

      let allConditionsMet = true;

      for (const condition of conditions) {
        const conditionMet = evaluateCondition(condition, userProgress);
        if (!conditionMet) {
          allConditionsMet = false;
          break; // No need to check further if one condition fails
        }
      }

      // Unlock nếu đủ điều kiện
      if (allConditionsMet) {
        const userAchievement = await UserAchievement.create({
          userId,
          achievementId: achievement._id,
          progress: 100,
          completed: true,
          notified: false,
        });

        // 🆕 Cập nhật achievementsUnlocked trong UserProgress
        userProgress.achievementsUnlocked =
          (userProgress.achievementsUnlocked || 0) + 1;

        newlyUnlocked.push({
          ...achievement.toObject(),
          unlockedAt: userAchievement.unlockedAt,
        });
      }
    }

    // Lưu userProgress nếu có achievement mới
    if (newlyUnlocked.length > 0) {
      await userProgress.save();
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
