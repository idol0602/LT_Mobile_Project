// routes/image.js
const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const { protect } = require("../middleware/auth");

// GET /api/images/:id
router.get("/:id", imageController.getImageById);

// POST /api/images/upload-avatar
router.post(
  "/upload-avatar",
  protect,
  imageController.upload.single("avatar"),
  imageController.uploadAvatar
);

module.exports = router;
