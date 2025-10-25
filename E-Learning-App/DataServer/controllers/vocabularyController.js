// controllers/vocabularyController.js
const Vocabulary = require("../models/vocabulary.model");
const { Readable } = require("stream");
const XLSX = require("xlsx");

// --- HÀM TIỆN ÍCH ĐỂ UPLOAD VÀO GRIDFS ---
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

// --- GET ALL: LẤY TẤT CẢ TỪ VỰNG ---
exports.getAllVocabularies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // --- LOGIC TÌM KIẾM MỚI ---
    const searchTerm = req.query.search || ""; // Lấy từ khóa tìm kiếm
    const searchLang = req.query.lang || "both"; // Lấy ngôn ngữ, mặc định là 'both'
    const posFilter = req.query.pos || "all"; // Lấy bộ lọc loại từ

    // Xây dựng điều kiện lọc (query filter)
    let queryFilter = {};

    // 1. Lọc theo loại từ (nếu có)
    if (posFilter !== "all") {
      queryFilter.partOfSpeech = posFilter;
    }

    // 2. Lọc theo từ khóa tìm kiếm (nếu có)
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Tìm kiếm không phân biệt hoa thường
      if (searchLang === "en") {
        queryFilter.word = regex; // Chỉ tìm trong trường 'word'
      } else if (searchLang === "vi") {
        queryFilter.definition = regex; // Chỉ tìm trong trường 'definition'
      } else {
        // 'both'
        queryFilter.$or = [
          // Tìm ở một trong hai trường
          { word: regex },
          { definition: regex },
        ];
      }
    }
    // --- KẾT THÚC LOGIC TÌM KIẾM ---

    // Lấy tổng số document khớp với bộ lọc
    const total = await Vocabulary.countDocuments(queryFilter);

    // Truy vấn database với bộ lọc và phân trang
    const vocabularies = await Vocabulary.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: vocabularies,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy từ vựng", error: error.message });
  }
};
exports.getVocabularyById = async (req, res) => {
  try {
    const vocab = await Vocabulary.findById(req.params.id);
    if (!vocab)
      return res.status(404).json({ message: "Vocabulary not found" });
    res.json({ data: vocab });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching vocabulary", error: error.message });
  }
};
exports.getVocabulariesByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res
        .status(400)
        .json({ message: "Invalid request: ids must be an array" });
    }

    const vocabularies = await Vocabulary.find({ _id: { $in: ids } });
    res.status(200).json({ data: vocabularies });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vocabularies by IDs",
      error: error.message,
    });
  }
};

// --- ADD: THÊM MỘT TỪ VỰNG MỚI ---
exports.addVocabulary = async (req, res) => {
  const {
    word,
    definition,
    pronunciation,
    partOfSpeech,
    exampleSentence,
    topic,
  } = req.body;
  const imageFile = req.file;

  if (!word || !definition || !partOfSpeech) {
    return res.status(400).json({
      message: "Các trường word, definition, partOfSpeech là bắt buộc",
    });
  }

  try {
    let imageFileId = null;
    if (imageFile) {
      const gridfsBucketImage = req.gridfsBucketImage;
      imageFileId = await uploadStreamToGridFS(
        imageFile.buffer,
        imageFile.originalname,
        gridfsBucketImage
      );
    }
    const newVocab = new Vocabulary({
      word,
      definition,
      pronunciation,
      partOfSpeech,
      exampleSentence,
      topic: topic || null,
      imageFileId,
    });
    await newVocab.save();
    res
      .status(201)
      .json({ message: "Đã thêm từ thành công", vocabulary: newVocab });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: `Từ "${word}" đã tồn tại.` });
    res
      .status(500)
      .json({ message: "Lỗi server khi thêm từ vựng", error: error.message });
  }
};

// --- UPDATE: CẬP NHẬT MỘT TỪ VỰNG (Đã hoàn thiện) ---
exports.updateVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    // Bỏ 'topic' ra khỏi updateData
    const { topic, ...updateData } = req.body;
    const oldVocab = await Vocabulary.findById(id);

    if (!oldVocab) {
      return res.status(404).json({ message: "Không tìm thấy từ vựng." });
    }

    if (req.file) {
      const gridfsBucketImage = req.gridfsBucketImage;
      const newImageFileId = await uploadStreamToGridFS(
        req.file.buffer,
        req.file.originalname,
        gridfsBucketImage
      );
      updateData.imageFileId = newImageFileId;
      if (oldVocab.imageFileId) {
        await gridfsBucketImage.delete(oldVocab.imageFileId);
      }
    }

    const updatedVocab = await Vocabulary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({ message: "Cập nhật thành công", vocabulary: updatedVocab });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật", error: error.message });
  }
};

// --- DELETE: XÓA MỘT TỪ VỰNG (Đã hoàn thiện) ---
exports.deleteVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVocab = await Vocabulary.findByIdAndDelete(id);

    if (!deletedVocab) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy từ vựng để xóa." });
    }

    // Xóa các file media liên quan trong GridFS
    if (deletedVocab.imageFileId) {
      await req.gridfsBucketImage.delete(deletedVocab.imageFileId);
      console.log(`🖼️ Đã xóa file ảnh: ${deletedVocab.imageFileId}`);
    }
    if (deletedVocab.audioFileId) {
      // Giả định bạn đã có gridfsBucketAudio trên req
      await req.gridfsBucketAudio.delete(deletedVocab.audioFileId);
      console.log(`🎵 Đã xóa file audio: ${deletedVocab.audioFileId}`);
    }

    res
      .status(200)
      .json({ message: "Xóa từ vựng và các file liên quan thành công." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi xóa", error: error.message });
  }
};
// --- LẤY THỐNG KÊ TỪ VỰNG ---
exports.getVocabularyStats = async (req, res) => {
  try {
    // Hàm này giờ đã có thể thấy 'Vocabulary'
    const stats = await Vocabulary.aggregate([
      {
        $group: {
          _id: "$partOfSpeech",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalWords = await Vocabulary.countDocuments();

    // Xử lý khi _id có thể null hoặc rỗng
    const countByPos = stats.map((item) => ({
      name: item._id
        ? item._id.charAt(0).toUpperCase() + item._id.slice(1)
        : "Chưa xác định", // Gán tên 'Chưa xác định'
      count: item.count,
    }));

    res.status(200).json({
      totalWords,
      countByPos,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê từ vựng:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy thống kê",
      error: error.message,
    });
  }
};
exports.importVocabularies = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Đọc buffer file Excel
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Chuyển sang JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    // Kiểm tra dữ liệu
    if (!data || data.length === 0)
      return res.status(400).json({ message: "File trống hoặc không hợp lệ" });

    // Lưu vào DB (ví dụ Mongoose)
    const inserted = await Vocabulary.insertMany(
      data.map((row) => ({
        word: row.word,
        definition: row.definition,
        partOfSpeech: row.partOfSpeech,
        pronunciation: row.pronunciation,
        exampleSentence: row.exampleSentence,
      }))
    );

    res.json({ message: `Import thành công ${inserted.length} từ vựng!` });
  } catch (err) {
    console.error("❌ Import failed:", err);
    res.status(500).json({ message: "Import thất bại", error: err.message });
  }
};
