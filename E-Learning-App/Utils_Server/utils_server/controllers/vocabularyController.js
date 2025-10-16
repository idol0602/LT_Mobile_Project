// controllers/vocabularyController.js
const Vocabulary = require("../models/vocabulary.model");
const { Readable } = require("stream");

// Lấy tất cả từ vựng với đầy đủ thông tin
exports.getAllVocabularies = async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find()
      .populate("topic", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(vocabularies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy từ vựng", error: error.message });
  }
};
exports.addVocabulary = async (req, res) => {
  // Lấy tất cả các trường từ body của request
  const {
    word,
    definition,
    pronunciation,
    partOfSpeech,
    exampleSentence,
    topic, // Sửa thành topic thay vì topicId cho nhất quán
  } = req.body;

  // Cập nhật điều kiện kiểm tra
  if (!word || !definition || !partOfSpeech) {
    return res
      .status(400)
      .json({
        message: "Các trường word, definition, partOfSpeech là bắt buộc",
      });
  }

  try {
    const newVocab = new Vocabulary({
      word,
      definition,
      pronunciation,
      partOfSpeech,
      exampleSentence,
      topic: topic || null, // Nếu không có topic thì gán là null
    });
    await newVocab.save();
    res
      .status(201)
      .json({ message: "Đã thêm từ thành công", vocabulary: newVocab });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: `Từ "${word}" đã tồn tại.` });
    }
    // Trả về lỗi chi tiết hơn để dễ debug
    res
      .status(500)
      .json({ message: "Lỗi server khi thêm từ vựng", error: error.message });
  }
};

// --- HÀM MỚI: UPLOAD HÌNH ẢNH CHO TỪ VỰNG ---
exports.uploadVocabularyImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Vui lòng chọn một file ảnh." });
  }

  const { id } = req.params; // ID của từ vựng cần cập nhật
  const gridfsBucketImage = req.gridfsBucketImage;

  const readableImageStream = Readable.from(req.file.buffer);
  const uploadStream = gridfsBucketImage.openUploadStream(
    req.file.originalname
  );
  const fileId = uploadStream.id;

  readableImageStream.pipe(uploadStream);

  uploadStream.on("finish", async () => {
    try {
      await Vocabulary.updateOne(
        { _id: id },
        { $set: { imageFileId: fileId } }
      );
      res
        .status(200)
        .json({ message: "Upload ảnh thành công!", fileId: fileId });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật DB." });
    }
  });

  uploadStream.on("error", (err) => {
    res.status(500).json({ message: "Lỗi khi upload ảnh.", error: err });
  });
};
