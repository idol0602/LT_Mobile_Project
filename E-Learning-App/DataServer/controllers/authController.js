const User = require("../models/user.model");
const crypto = require("crypto");

// Store OTP in memory (trong production nên dùng Redis)
const otpStore = new Map();

/**
 * POST /api/auth/forgot-password
 * Gửi OTP về email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP với thời gian hết hạn (5 phút)
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    // TODO: Trong production, gửi email thật
    // Hiện tại chỉ log ra console
    console.log(`📧 OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP has been sent to your email",
      // Chỉ để test, xóa dòng này trong production
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Xác minh OTP
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpData = otpStore.get(email.toLowerCase());

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new one",
      });
    }

    // Kiểm tra hết hạn
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    // Kiểm tra số lần thử
    if (otpData.attempts >= 3) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP",
      });
    }

    // Kiểm tra OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        remainingAttempts: 3 - otpData.attempts,
      });
    }

    // OTP đúng, tạo token để reset password
    const resetToken = crypto.randomBytes(32).toString("hex");
    otpStore.set(`reset_${email.toLowerCase()}`, {
      resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Xóa OTP đã dùng
    otpStore.delete(email.toLowerCase());

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Đổi mật khẩu mới
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const resetData = otpStore.get(`reset_${email.toLowerCase()}`);

    if (!resetData || resetData.resetToken !== resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (Date.now() > resetData.expiresAt) {
      otpStore.delete(`reset_${email.toLowerCase()}`);
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }

    // Cập nhật mật khẩu
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    // Xóa reset token
    otpStore.delete(`reset_${email.toLowerCase()}`);

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/resend-otp
 * Gửi lại OTP
 */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP với thời gian hết hạn (5 phút)
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    console.log(`📧 Resent OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP has been resent to your email",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};
