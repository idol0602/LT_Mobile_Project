// routes/image.js
const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");

// GET /api/images/:id
router.get("/:id", imageController.getImageById);

module.exports = router;
