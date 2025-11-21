// controllers/progressController.js
const UserProgress = require("../models/progress.model");

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
    const { lessonId, category } = req.body;

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

    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      progress = new UserProgress({ userId });
    }

    // Thêm lessonId vào data nếu chưa có
    if (!progress[category].data.includes(lessonId)) {
      progress[category].data.push(lessonId);
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
    } else {
      // Lần đầu học
      progress.streak = 1;
    }

    progress.lastStudyDate = new Date();

    // Tính completed percent nếu có totalLessons
    if (progress.totalLessons && progress.totalLessons[category] > 0) {
      progress[category].completedPercent = Math.round(
        (progress[category].data.length / progress.totalLessons[category]) * 100
      );
    }

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
 * PUT /api/progress/:userId/current-lesson
 * Cập nhật lesson hiện tại đang học
 * Body: { lessonId, category, progress }
 */
exports.updateCurrentLesson = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lessonId, category, progress: lessonProgress } = req.body;

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }

    userProgress.currentLesson = {
      lessonId,
      category,
      progress: lessonProgress || 0,
    };

    await userProgress.save();

    res.json({
      success: true,
      message: "Current lesson updated",
      data: userProgress,
    });
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
