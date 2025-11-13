// controllers/lessonController.js
const Lesson = require("../models/lesson.model");
const multer = require("multer");
const mongoose = require("mongoose");
const { Readable } = require("stream");

const storage = multer.memoryStorage();
const uploadStreamToGridFS = (buffer, filename, bucket) => {
  return new Promise((resolve, reject) => {
    const readableStream = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(filename);
    const fileId = uploadStream.id;
    readableStream.pipe(uploadStream);
    uploadStream.on("finish", () => resolve(fileId));
    uploadStream.on("error", (err) => reject(err));
  });
};

exports.createLesson = async (req, res) => {
  try {
    const { name, level, topic, type, questions, readingContent } = req.body;

    // Parse questions nếu gửi dưới dạng JSON string
    let parsedQuestions = [];
    if (questions)
      parsedQuestions =
        typeof questions === "string" ? JSON.parse(questions) : questions;

    // Tạo GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "audioFiles",
    });

    // ✅ Upload từng file audio và map vào question tương ứng
    if (req.files && req.files.length > 0) {
      parsedQuestions = await Promise.all(
        parsedQuestions.map(async (q, index) => {
          const file = req.files[index]; // gán theo thứ tự
          if (file) {
            const fileId = await uploadStreamToGridFS(
              file.buffer,
              file.originalname,
              bucket
            );
            return { ...q, audioFileId: fileId };
          }
          return q;
        })
      );
    }

    // Tạo lesson mới
    const newLesson = new Lesson({
      name,
      level,
      topic,
      type,
      readingContent: readingContent || "",
      questions: parsedQuestions,
    });

    await newLesson.save();

    res.status(201).json({
      message: "✅ Đã tạo bài học mới",
      lesson: newLesson,
    });
  } catch (err) {
    console.error("❌ Error creating lesson:", err);
    res.status(500).json({
      message: "Lỗi khi tạo bài học",
      error: err.message,
    });
  }
};

// 📋 Lấy tất cả bài học
//
// 📋 Lấy tất cả bài học (Hỗ trợ Phân trang, Lọc, Tìm kiếm)
exports.getAllLessons = async (req, res) => {
  try {
    // 1. Lấy tham số từ query string (URL)
    const {
      page = 1, // Trang hiện tại, mặc định là 1
      limit = 10, // Số mục trên mỗi trang, mặc định là 10
      searchTerm = "", // Từ khóa tìm kiếm
      level = "all", // Lọc theo level
      type = "all", // Lọc theo type
    } = req.query; // 2. Tính toán skip (bỏ qua) cho Mongoose

    const skip = (parseInt(page) - 1) * parseInt(limit); // 3. Xây dựng đối tượng query động

    const queryObject = {};

    if (level && level !== "all") {
      queryObject.level = level;
    }

    if (type && type !== "all") {
      queryObject.type = type;
    }

    if (searchTerm) {
      // Tìm kiếm không phân biệt chữ hoa/thường ($options: 'i')
      // Tìm trong cả 'name' VÀ 'topic'
      queryObject.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { topic: { $regex: searchTerm, $options: "i" } },
      ];
    } // 4. Thực thi 2 query song song (một lấy data, một đếm tổng số)

    const [lessons, totalLessons] = await Promise.all([
      // Query lấy danh sách bài học
      Lesson.find(queryObject)
        .populate("vocabularies")
        .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
        .skip(skip)
        .limit(parseInt(limit)), // Query đếm tổng số document khớp với bộ lọc
      Lesson.countDocuments(queryObject),
    ]); // 5. Trả về kết quả

    res.json({
      data: lessons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLessons / parseInt(limit)),
        totalItems: totalLessons,
        limit: parseInt(limit),
      },
    });
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

// 📋 Lấy tất cả bài học theo type (không phân trang)
// Type có thể là: 'vocab', 'grammar', 'reading', 'listen', hoặc 'all'
exports.getLessonsByType = async (req, res) => {
  try {
    const { type } = req.params; // Lấy type từ URL params

    // Xây dựng query object
    const queryObject = {};

    // Nếu type được cung cấp và không phải "all", thêm vào query
    if (type && type !== "all") {
      queryObject.type = type;
    }

    const lessons = await Lesson.find(queryObject)
      .populate("vocabularies")
      .sort({ createdAt: -1 });

    // Trả về kết quả
    res.json({
      data: lessons,
      totalItems: lessons.length,
      type: type || "all",
    });
  } catch (error) {
    console.error("❌ Error fetching lessons by type:", error);
    res.status(500).json({
      message: "Failed to fetch lessons by type",
      error: error.message,
    });
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
