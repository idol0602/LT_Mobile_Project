// routes/audio.js
const express = require("express");
const router = express.Router();

const audioController = require("../controllers/audioController");

// Route GET: /api/audio/play?word=...
router.get("/play", audioController.getOrCreateAudio);

module.exports = router;
