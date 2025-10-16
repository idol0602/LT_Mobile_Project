// controllers/imageController.js
const mongoose = require("mongoose");

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
