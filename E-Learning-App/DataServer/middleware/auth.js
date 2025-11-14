// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Middleware bảo vệ route yêu cầu authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Kiểm tra token có tồn tại
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập. Vui lòng đăng nhập.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      // Lấy thông tin user từ token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }
  } catch (error) {
    console.error("Lỗi authentication middleware:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực",
      error: error.message,
    });
  }
};

// Middleware kiểm tra role admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Không có quyền truy cập. Chỉ dành cho admin.",
    });
  }
};
