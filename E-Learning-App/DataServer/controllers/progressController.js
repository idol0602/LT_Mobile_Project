// controllers/progressController.js
const UserProgress = require("../models/progress.model");
const Lesson = require("../models/lesson.model");

/**
 * Helper function: Lấy tổng số lesson theo type và tính completedPercent
 */
const calculateCompletedPercent = async (
  progress,
  category,
  lessonType = null
) => {
  try {
    // Use lessonType if provided, otherwise use category
    const typeToCount = lessonType || category;
    const totalCount = await Lesson.countDocuments({ type: typeToCount });
    const completedCount = progress[category].data.length;

    console.log(
      `Calculating ${category} progress: ${completedCount}/${totalCount} lessons (type: ${typeToCount})`
    );

    if (totalCount > 0) {
      return Math.round((completedCount / totalCount) * 100);
    }
    return 0;
  } catch (error) {
    console.error(`Error calculating percent for ${category}:`, error);
    return 0;
  }
};

/**
 * GET /api/progress/:userId
 * Lấy tiến trình học tập của user
 */
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    let progress = await UserProgress.findOne({ userId });

    // Nếu chưa có progress, tạo mới
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        reading: { data: [], completedPercent: 0 },
        vocab: { data: [], wordsLearned: 0, completedPercent: 0 },
        listening: { data: [], completedPercent: 0 },
        grammar: { data: [], completedPercent: 0 },
        streak: 0,
        totalLessons: {
          reading: 0,
          vocab: 0,
          listening: 0,
          grammar: 0,
        },
      });
    }

    // Map category to lesson type for accurate counting
    const categoryToLessonType = {
      reading: "reading",
      vocab: "vocab",
      listening: "listen",
      grammar: "grammar",
    };

    // Recalculate completedPercent for all categories to ensure accuracy
    const categories = ["reading", "vocab", "listening", "grammar"];
    for (const category of categories) {
      const lessonType = categoryToLessonType[category];
      progress[category].completedPercent = await calculateCompletedPercent(
        progress,
        category,
        lessonType
      );
    }

    // Debug logs
    console.log("=== USER PROGRESS DEBUG ===");
    console.log("UserId:", userId);
    console.log("Vocab progress:", {
      dataLength: progress.vocab?.data?.length || 0,
      completedPercent: progress.vocab?.completedPercent || 0,
      lessonType: categoryToLessonType.vocab,
    });
    console.log("Current lesson:", progress.currentLesson);
    console.log("===========================");

    // Save updated progress
    await progress.save();

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error getting user progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user progress",
      error: error.message,
    });
  }
};

/**
 * POST /api/progress/:userId/complete-lesson
 * Đánh dấu một lesson đã hoàn thành
 * Body: { lessonId, category } - category: 'reading' | 'vocab' | 'listening' | 'grammar'
 */
exports.completeLesson = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lessonId, category, score, completionTime } = req.body;

    if (!lessonId || !category) {
      return res.status(400).json({
        success: false,
        message: "lessonId and category are required",
      });
    }

    const validCategories = ["reading", "vocab", "listening", "grammar"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(
          ", "
        )}`,
      });
    }

    // Map category to lesson type for counting
    const categoryToLessonType = {
      reading: "reading",
      vocab: "vocab",
      listening: "listen",
      grammar: "grammar",
    };

    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      progress = new UserProgress({ userId });
    }

    // Thêm lessonId vào data nếu chưa có
    if (!progress[category].data.includes(lessonId)) {
      progress[category].data.push(lessonId);
      console.log(
        `✅ Added lesson ${lessonId} to ${category} progress. Total: ${progress[category].data.length}`
      );
    } else {
      console.log(`⚠️ Lesson ${lessonId} already completed for ${category}`);
    }

    // Update last study date và streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (progress.lastStudyDate) {
      const lastDate = new Date(progress.lastStudyDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Học liên tục ngày kế tiếp
        progress.streak += 1;
      } else if (diffDays > 1) {
        // Bỏ lỡ, reset streak
        progress.streak = 1;
      }
      // diffDays === 0 nghĩa là học cùng ngày, không thay đổi streak

      // Reset lessonsToday if new day
      if (diffDays >= 1) {
        progress.lessonsToday = 1;
      } else {
        progress.lessonsToday = (progress.lessonsToday || 0) + 1;
      }
    } else {
      // Lần đầu học
      progress.streak = 1;
      progress.lessonsToday = 1;
    }

    progress.lastStudyDate = new Date();

    // 🆕 Lưu thông tin achievement-related
    progress.lastLessonScore = score || 0;
    progress.lastCategory = category;
    progress.lastCompletionTime = completionTime || 0;

    // 🆕 Tự động tính completedPercent dựa trên tổng lessons trong DB
    const lessonType = categoryToLessonType[category];
    progress[category].completedPercent = await calculateCompletedPercent(
      progress,
      category,
      lessonType
    );

    // Update words learned cho vocab
    if (category === "vocab") {
      // Có thể tính từ số lượng từ vựng trong lessons đã hoàn thành
      // Tạm thời để mặc định hoặc có thể truyền từ client
      progress.vocab.wordsLearned = progress.vocab.data.length * 10; // giả sử mỗi lesson có 10 từ
    }

    // Lưu currentLesson khi hoàn thành
    progress.currentLesson = {
      lessonId: lessonId,
      category: category,
      progress: 100, // Đã hoàn thành
    };

    await progress.save();

    console.log(
      `🎯 Lesson completion result for ${category}: ${progress[category].completedPercent}% (${progress[category].data.length} lessons)`
    );

    res.json({
      success: true,
      message: "Lesson completed successfully",
      data: progress,
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete lesson",
      error: error.message,
    });
  }
};

/**
 * POST /api/progress/:userId/start-lesson
 * Bắt đầu một lesson mới (chỉ khi user thực sự bắt đầu làm bài)
 * Body: { lessonId, category }
 */
exports.startLesson = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lessonId, category } = req.body;

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }

    // Chỉ set currentLesson khi user thực sự bắt đầu lesson
    userProgress.currentLesson = {
      lessonId,
      category,
      progress: 1, // 1% để đánh dấu đã bắt đầu
    };

    await userProgress.save();

    res.json({
      success: true,
      message: "Lesson started",
      data: userProgress,
    });
  } catch (error) {
    console.error("Error starting lesson:", error);
    res.status(500).json({
      success: false,
      message: "Error starting lesson",
      error: error.message,
    });
  }
};

/**
 * PUT /api/progress/:userId/current-lesson
 * Cập nhật lesson hiện tại đang học
 * Body: { lessonId, category, progress }
 * CHỈ cập nhật khi có progress thực tế (> 0) để tránh ghi nhận lesson chưa bắt đầu
 */
exports.updateCurrentLesson = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lessonId, category, progress: lessonProgress } = req.body;

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }

    // CHỈ cập nhật currentLesson khi có progress thực tế (> 0)
    // Tránh tình trạng vào lesson nhưng chưa làm gì đã được coi là current lesson
    if (lessonProgress > 0) {
      userProgress.currentLesson = {
        lessonId,
        category,
        progress: lessonProgress,
      };

      await userProgress.save();

      res.json({
        success: true,
        message: "Current lesson updated",
        data: userProgress,
      });
    } else {
      // Nếu progress = 0, không cập nhật currentLesson
      res.json({
        success: true,
        message: "No progress to update - lesson not started",
        data: userProgress,
      });
    }
  } catch (error) {
    console.error("Error updating current lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update current lesson",
      error: error.message,
    });
  }
};

/**
 * PUT /api/progress/:userId/total-lessons
 * Cập nhật tổng số lessons cho mỗi category (dùng để tính percent)
 * Body: { reading, vocab, listening, grammar }
 */
exports.updateTotalLessons = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reading, vocab, listening, grammar } = req.body;

    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      progress = new UserProgress({ userId });
    }

    progress.totalLessons = {
      reading: reading || progress.totalLessons.reading || 0,
      vocab: vocab || progress.totalLessons.vocab || 0,
      listening: listening || progress.totalLessons.listening || 0,
      grammar: grammar || progress.totalLessons.grammar || 0,
    };

    // Recalculate all percentages
    ["reading", "vocab", "listening", "grammar"].forEach((category) => {
      if (progress.totalLessons[category] > 0) {
        progress[category].completedPercent = Math.round(
          (progress[category].data.length / progress.totalLessons[category]) *
            100
        );
      }
    });

    await progress.save();

    res.json({
      success: true,
      message: "Total lessons updated",
      data: progress,
    });
  } catch (error) {
    console.error("Error updating total lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update total lessons",
      error: error.message,
    });
  }
};

/**
 * GET /api/progress/:userId/stats
 * Lấy thống kê tổng quan
 */
exports.getProgressStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.json({
        success: true,
        data: {
          totalCompleted: 0,
          streak: 0,
          wordsLearned: 0,
          categories: {
            reading: { completed: 0, percent: 0 },
            vocab: { completed: 0, percent: 0 },
            listening: { completed: 0, percent: 0 },
            grammar: { completed: 0, percent: 0 },
          },
        },
      });
    }

    const stats = {
      totalCompleted:
        progress.reading.data.length +
        progress.vocab.data.length +
        progress.listening.data.length +
        progress.grammar.data.length,
      streak: progress.streak,
      wordsLearned: progress.vocab.wordsLearned,
      lastStudyDate: progress.lastStudyDate,
      currentLesson: progress.currentLesson,
      categories: {
        reading: {
          completed: progress.reading.data.length,
          percent: progress.reading.completedPercent,
        },
        vocab: {
          completed: progress.vocab.data.length,
          percent: progress.vocab.completedPercent,
        },
        listening: {
          completed: progress.listening.data.length,
          percent: progress.listening.completedPercent,
        },
        grammar: {
          completed: progress.grammar.data.length,
          percent: progress.grammar.completedPercent,
        },
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting progress stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get progress stats",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/progress/:userId/reset
 * Reset toàn bộ tiến trình (dùng cho testing hoặc reset user)
 */
exports.resetProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    progress.reading = { data: [], completedPercent: 0 };
    progress.vocab = { data: [], wordsLearned: 0, completedPercent: 0 };
    progress.listening = { data: [], completedPercent: 0 };
    progress.grammar = { data: [], completedPercent: 0 };
    progress.currentLesson = {};
    progress.streak = 0;
    progress.lastStudyDate = null;

    await progress.save();

    res.json({
      success: true,
      message: "Progress reset successfully",
      data: progress,
    });
  } catch (error) {
    console.error("Error resetting progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset progress",
      error: error.message,
    });
  }
};

/**
 * POST /api/progress/:userId/start-app-session
 * Bắt đầu app session (khi user vào app)
 */
exports.startAppSession = async (req, res) => {
  try {
    const { userId } = req.params;

    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      progress = new UserProgress({ userId });
    }

    progress.lastAppSessionStart = new Date();
    await progress.save();

    res.json({
      success: true,
      message: "App session started",
      data: {
        sessionStartTime: progress.lastAppSessionStart,
      },
    });
  } catch (error) {
    console.error("Error starting app session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start app session",
      error: error.message,
    });
  }
};

/**
 * POST /api/progress/:userId/end-app-session
 * Kết thúc app session và cập nhật total app time
 */
exports.endAppSession = async (req, res) => {
  try {
    const { userId } = req.params;
    const { duration } = req.body; // duration in seconds

    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "User progress not found",
      });
    }

    const appDuration = duration || 0;

    // Update total app time
    progress.totalAppTime = (progress.totalAppTime || 0) + appDuration;
    progress.lastAppSessionStart = null;
    await progress.save();

    res.json({
      success: true,
      message: "App session ended",
      data: {
        appDuration,
        totalAppTime: progress.totalAppTime,
      },
    });
  } catch (error) {
    console.error("Error ending app session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end app session",
      error: error.message,
    });
  }
};

/**
 * GET /api/progress/:userId/app-time
 * Lấy tổng thời gian truy cập app
 */
exports.getAppTime = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "User progress not found",
      });
    }

    res.json({
      success: true,
      data: {
        totalAppTime: progress.totalAppTime || 0,
      },
    });
  } catch (error) {
    console.error("Error getting app time:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get app time",
      error: error.message,
    });
  }
};
