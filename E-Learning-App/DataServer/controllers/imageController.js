// controllers/imageController.js
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

exports.upload = upload;

exports.getImageById = (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const gridfsBucketImage = req.gridfsBucketImage;
    const downloadStream = gridfsBucketImage.openDownloadStream(fileId);
    downloadStream.pipe(res);
    downloadStream.on("error", () => {
      res.status(404).json({ message: "Không tìm thấy ảnh." });
    });
  } catch (error) {
    res.status(400).json({ message: "ID file không hợp lệ." });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không có file ảnh được upload",
      });
    }

    const gridfsBucketImage = req.gridfsBucketImage;
    const filename = `avatar_${req.user.id}_${Date.now()}`;

    const uploadStream = gridfsBucketImage.openUploadStream(filename, {
      metadata: {
        userId: req.user.id,
        type: "avatar",
        originalName: req.file.originalname,
        uploadDate: new Date(),
      },
    });

    // Upload the file buffer
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.status(200).json({
        success: true,
        message: "Upload avatar thành công",
        data: {
          fileId: uploadStream.id,
          filename: filename,
          url: `/api/images/${uploadStream.id}`,
        },
      });
    });

    uploadStream.on("error", (error) => {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi upload avatar",
        error: error.message,
      });
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi upload avatar",
      error: error.message,
    });
  }
};
