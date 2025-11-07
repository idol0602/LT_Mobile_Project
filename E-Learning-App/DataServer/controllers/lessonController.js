// controllers/lessonController.js
const Lesson = require("../models/lesson.model");

// ➕ Thêm bài học mới
exports.createLesson = async (req, res) => {
  try {
    console.log("📥 Nhận dữ liệu:", req.body);

    const lesson = new Lesson(req.body);
    const savedLesson = await lesson.save();

    console.log("✅ Lesson đã lưu vào DB:", savedLesson);
    console.log("📁 Database:", lesson.db.name); // 👈 Kiểm tra tên DB thực tế
    console.log("📂 Collection:", lesson.collection.collectionName);

    res.status(201).json({
      message: "Lesson created successfully",
      data: savedLesson,
    });
  } catch (error) {
    console.error("❌ Error creating lesson:", error);
    res
      .status(400)
      .json({ message: "Failed to create lesson", error: error.message });
  }
};

// 📋 Lấy tất cả bài học
exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate("vocabularies");
    res.json({ data: lessons });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch lessons", error: error.message });
  }
};

// 🔍 Lấy 1 bài học
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate(
      "vocabularies"
    );
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ data: lesson });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching lesson", error: error.message });
  }
};

// ✏️ Cập nhật
exports.updateLesson = async (req, res) => {
  try {
    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Lesson updated successfully", data: updated });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update lesson", error: error.message });
  }
};

// 🗑️ Xóa
exports.deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete lesson", error: error.message });
  }
};

exports.getVocabulariesByLessonId = async (req, res) => {
  try {
    // 1. Tìm bài học theo ID được cung cấp
    const lesson = await Lesson.findById(req.params.id).populate(
      "vocabularies"
    ); // 2. Kiểm tra nếu không tìm thấy bài học

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    } // 3. Trả về chỉ mảng 'vocabularies' đã được populate

    res.json({ data: lesson.vocabularies });
  } catch (error) {
    console.error("❌ Error fetching vocabularies for lesson:", error);
    res.status(500).json({
      message: "Failed to fetch vocabularies for lesson",
      error: error.message,
    });
  }
};
