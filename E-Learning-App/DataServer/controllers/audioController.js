// controllers/audioController.js
const Vocabulary = require("../models/vocabulary.model");
const axios = require("axios");
const { Readable } = require("stream");
const mongoose = require("mongoose");

exports.getOrCreateAudio = async (req, res) => {
  const word = req.query.word?.toLowerCase().trim();
  if (!word) {
    return res.status(400).json({ error: "Word parameter is required." });
  }

  try {
    const vocabulary = await Vocabulary.findOne({ word: word });

    // === TRƯỜNG HỢP 1: CACHE HIT ===
    if (vocabulary && vocabulary.audioFileId) {
      console.log(`✅ Cache HIT cho từ: "${word}"`);
      // SỬA LẠI TẠI ĐÂY: Dùng đúng tên biến từ middleware
      const gridfsBucketAudio = req.gridfsBucketAudio;
      const downloadStream = gridfsBucketAudio.openDownloadStream(
        vocabulary.audioFileId
      );
      res.set("Content-Type", "audio/mpeg");
      downloadStream.pipe(res);
      downloadStream.on("error", () => {
        res.status(404).json({ error: "Audio file not found." });
      });
      return;
    }

    // === TRƯỜNG HỢP 2: CACHE MISS ===
    console.log(`❌ Cache MISS cho từ: "${word}". Đang lấy từ API...`);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      word
    )}&tl=en&client=tw-ob`;
    const response = await axios({
      url: ttsUrl,
      method: "GET",
      responseType: "arraybuffer",
    });

    const audioBuffer = Buffer.from(response.data);
    const readableAudioStream = Readable.from(audioBuffer);

    // SỬA LẠI TẠI ĐÂY: Dùng đúng tên biến từ middleware
    const gridfsBucketAudio = req.gridfsBucketAudio;
    const uploadStream = gridfsBucketAudio.openUploadStream(`${word}.mp3`);
    const fileId = uploadStream.id;

    readableAudioStream.pipe(uploadStream);

    uploadStream.on("finish", async () => {
      console.log(
        `💾 Đã lưu audio cho từ "${word}" vào GridFS. File ID: ${fileId}`
      );
      await Vocabulary.updateOne(
        { word: word },
        { $set: { audioFileId: fileId } },
        { upsert: true }
      );
      const downloadStream = gridfsBucketAudio.openDownloadStream(fileId);
      res.set("Content-Type", "audio/mpeg");
      downloadStream.pipe(res);
    });

    uploadStream.on("error", (err) => {
      console.error("Lỗi khi upload lên GridFS:", err);
      res.status(500).json({ error: "Failed to save audio." });
    });
  } catch (error) {
    console.error("Lỗi server:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Lấy audio file từ GridFS bằng ID
exports.getAudioById = async (req, res) => {
  try {
    const fileId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const gridfsBucketAudio = req.gridfsBucketAudio;
    const downloadStream = gridfsBucketAudio.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    res.set("Content-Type", "audio/mpeg");
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("Error downloading audio file:", err);
      res.status(404).json({ error: "Audio file not found" });
    });
  } catch (error) {
    console.error("Error in getAudioById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
