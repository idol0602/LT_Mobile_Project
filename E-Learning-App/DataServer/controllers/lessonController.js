// controllers/lessonController.js
const Lesson = require("../models/lesson.model");
const Vocabulary = require("../models/vocabulary.model");
const multer = require("multer");
const mongoose = require("mongoose");
const { Readable } = require("stream");
const XLSX = require("xlsx");

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
    const {
      name,
      level,
      topic,
      type,
      questions,
      readingContent,
      vocabularies,
    } = req.body;

    // Parse questions nếu gửi dưới dạng JSON string
    let parsedQuestions = [];
    if (questions)
      parsedQuestions =
        typeof questions === "string" ? JSON.parse(questions) : questions;

    // Tạo GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "audios",
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
      vocabularies: vocabularies || [], // 🆕 Support vocab lesson
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
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid lesson ID format" });
    }

    const lesson = await Lesson.findById(req.params.id)
      .populate({
        path: "vocabularies",
        options: { strictPopulate: false }, // Don't fail if some refs are invalid
      })
      .lean(); // Convert to plain JS object for better performance

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ data: lesson });
  } catch (error) {
    console.error("❌ Error fetching lesson by ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching lesson", error: error.message });
  }
};

// ✏️ Cập nhật
exports.updateLesson = async (req, res) => {
  try {
    const {
      name,
      level,
      topic,
      type,
      questions,
      readingContent,
      vocabularies,
    } = req.body;

    // Parse questions nếu gửi dưới dạng JSON string
    let parsedQuestions = [];
    if (questions) {
      parsedQuestions =
        typeof questions === "string" ? JSON.parse(questions) : questions;
    }

    // Nếu có audio files mới, upload chúng
    if (req.files && req.files.length > 0) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "audios",
      });

      parsedQuestions = await Promise.all(
        parsedQuestions.map(async (q, index) => {
          const file = req.files[index];
          // Nếu có file mới, upload và thay thế audioFileId
          if (file) {
            const fileId = await uploadStreamToGridFS(
              file.buffer,
              file.originalname,
              bucket
            );
            return { ...q, audioFileId: fileId };
          }
          // Nếu không có file mới, giữ nguyên audioFileId cũ
          return q;
        })
      );
    }

    const updateData = {
      name,
      level,
      topic,
      type,
      readingContent,
      questions: parsedQuestions,
      vocabularies, // 🆕 Support vocab lesson
    };

    // Loại bỏ các field undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updated = await Lesson.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson updated successfully", data: updated });
  } catch (error) {
    console.error("❌ Error updating lesson:", error);
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

// 📊 Lấy tổng số lesson theo từng loại (vocab, grammar, reading, listening)
exports.getLessonCountByType = async (req, res) => {
  try {
    const counts = await Lesson.aggregate([
      {
        $group: {
          _id: "$type", // Group theo field type
          count: { $sum: 1 }, // Đếm số lượng
        },
      },
    ]);

    // Chuyển đổi từ array sang object để dễ sử dụng
    const result = {
      vocab: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
      total: 0,
    };

    counts.forEach((item) => {
      if (item._id && result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
        result.total += item.count;
      }
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error getting lesson count by type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get lesson count",
      error: error.message,
    });
  }
};

/**
 * Import Lesson từ Excel file (3 sheets: Lesson Info, Vocabularies, Questions)
 * POST /api/lessons/import
 * Body: FormData with 'excel' file and optional 'audios' files
 */
exports.importLesson = async (req, res) => {
  try {
    // Kiểm tra file Excel
    if (!req.files || !req.files.excel || req.files.excel.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const excelFile = req.files.excel[0];
    const audioFiles = req.files.audios || [];

    // Đọc Excel file
    const workbook = XLSX.read(excelFile.buffer, { type: "buffer" });

    // SHEET 1: Lesson Info
    if (!workbook.SheetNames.includes("Lesson Info")) {
      return res.status(400).json({
        success: false,
        message: "Sheet 'Lesson Info' not found",
      });
    }

    const lessonInfoSheet = workbook.Sheets["Lesson Info"];
    const lessonInfoData = XLSX.utils.sheet_to_json(lessonInfoSheet);

    if (lessonInfoData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lesson Info sheet is empty",
      });
    }

    const lessonInfo = lessonInfoData[0];
    const { name, level, topic, type, readingContent } = lessonInfo;

    // Validate lesson info
    if (!name || !level || !topic || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, level, topic, type",
      });
    }

    if (!["vocab", "listen", "grammar", "reading"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be: vocab, listen, grammar, or reading",
      });
    }

    let vocabularyIds = [];
    let questions = [];

    // SHEET 2: Vocabularies (for vocab type)
    if (type === "vocab") {
      if (!workbook.SheetNames.includes("Vocabularies")) {
        return res.status(400).json({
          success: false,
          message: "Sheet 'Vocabularies' not found for vocab lesson",
        });
      }

      const vocabSheet = workbook.Sheets["Vocabularies"];
      const vocabData = XLSX.utils.sheet_to_json(vocabSheet);

      if (vocabData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Vocabularies sheet is empty",
        });
      }

      // Tạo từng vocabulary và lưu vào DB
      const vocabPromises = vocabData.map(async (row) => {
        const vocab = new Vocabulary({
          word: row.word || row.Word,
          definition: row.meaning || row.Meaning,
          partOfSpeech: "noun", // Default, có thể thêm vào Excel
          exampleSentence: row.exampleSentence || row.ExampleSentence || "",
        });
        await vocab.save();
        return vocab._id;
      });

      vocabularyIds = await Promise.all(vocabPromises);
      console.log(`✅ Created ${vocabularyIds.length} vocabularies`);
    }

    // SHEET 3: Questions (for listen, grammar, reading)
    if (["listen", "grammar", "reading"].includes(type)) {
      if (!workbook.SheetNames.includes("Questions")) {
        return res.status(400).json({
          success: false,
          message: `Sheet 'Questions' not found for ${type} lesson`,
        });
      }

      const questionSheet = workbook.Sheets["Questions"];
      const questionData = XLSX.utils.sheet_to_json(questionSheet);

      if (questionData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Questions sheet is empty",
        });
      }

      // Tạo GridFS bucket cho audio
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "audios",
      });

      // Map audio files by filename
      const audioMap = {};
      if (audioFiles.length > 0) {
        for (const file of audioFiles) {
          const fileId = await uploadStreamToGridFS(
            file.buffer,
            file.originalname,
            bucket
          );
          audioMap[file.originalname] = fileId;
          console.log(`✅ Uploaded audio: ${file.originalname}`);
        }
      }

      // Parse questions
      questions = questionData.map((row) => {
        const optionsString = row.options || row.Options || "";
        const optionsArray = optionsString.split("|").map((opt) => opt.trim());

        const question = {
          questionText: row.questionText || row.QuestionText || "",
          options: optionsArray,
          correctAnswerIndex:
            Number(row.correctAnswerIndex || row.CorrectAnswerIndex) || 0,
          answerText: row.answerText || row.AnswerText || "",
        };

        // Map audio file nếu có
        const audioFileName = row.audioFileName || row.AudioFileName;
        if (audioFileName && audioMap[audioFileName]) {
          question.audioFileId = audioMap[audioFileName];
        }

        return question;
      });

      console.log(`✅ Parsed ${questions.length} questions`);
    }

    // Tạo Lesson
    const lessonData = {
      name,
      level,
      topic,
      type,
    };

    if (type === "vocab") {
      lessonData.vocabularies = vocabularyIds;
    } else if (type === "reading" || type === "grammar") {
      // Cả reading và grammar đều cần readingContent
      lessonData.readingContent = readingContent || "";
      lessonData.questions = questions;
    } else if (type === "listen") {
      // Listen chỉ cần questions
      lessonData.questions = questions;
    }

    const lesson = new Lesson(lessonData);
    await lesson.save();

    console.log(`✅ Created lesson: ${lesson.name} (${lesson.type})`);

    res.json({
      success: true,
      message: "Lesson imported successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("❌ Error importing lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import lesson",
      error: error.message,
    });
  }
};
