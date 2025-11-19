// routes/audio.js
const express = require("express");
const router = express.Router();

const audioController = require("../controllers/audioController");

// Route GET: /api/audio/play?word=...
router.get("/play", audioController.getOrCreateAudio);

// Route GET: /api/audio/:id - Lấy audio file từ GridFS bằng ID
router.get("/:id", audioController.getAudioById);

module.exports = router;
