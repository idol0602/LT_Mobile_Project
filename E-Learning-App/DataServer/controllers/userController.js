// controllers/userController.js
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Cấu hình email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// Gửi email xác nhận (link)
const sendVerificationEmail = async (email, token, fullName) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xác nhận đăng ký tài khoản - BearEnglish",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Chào mừng ${fullName}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại BearEnglish.</p>
        <p>Vui lòng nhấn vào nút bên dưới để xác nhận email của bạn:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; 
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Xác nhận Email
        </a>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email xác nhận đã được gửi đến:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    return { success: false, error };
  }
};

// Gửi email OTP
const sendOTPEmail = async (email, otp, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mã xác nhận đăng ký - BearEnglish",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Chào mừng ${fullName}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại BearEnglish.</p>
        <p>Mã OTP xác nhận của bạn là:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #4CAF50; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
        </div>
        <p>Mã này sẽ hết hạn sau <strong>10 phút</strong>.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP đã được gửi đến:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi gửi OTP:", error);
    return { success: false, error };
  }
};

// Gửi email OTP reset password
const sendResetPasswordOTP = async (email, otp, fullName) => {
  const mailOptions = {
    from: {
      name: "Bear English",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "🔐 Đặt lại mật khẩu - Bear English",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 40px;
            text-align: center;
          }
          .content {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-top: 20px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
          }
          .subtitle {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 20px;
            font-size: 16px;
          }
          h1 {
            color: #2563eb;
            margin-bottom: 15px;
            font-size: 24px;
          }
          .greeting {
            color: #4b5563;
            margin-bottom: 20px;
          }
          .otp-box {
            background: #f3f4f6;
            border: 2px dashed #2563eb;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
          }
          .otp-label {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .otp-code {
            font-size: 40px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 10px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            border-radius: 6px;
          }
          .warning-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 8px;
          }
          .warning ul {
            margin: 10px 0;
            padding-left: 20px;
            color: #92400e;
          }
          .warning li {
            margin: 5px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .security-note {
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 12px;
            margin: 15px 0;
            color: #991b1b;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🐻 Bear English</div>
          <div class="subtitle">Your English Learning Companion</div>
          
          <div class="content">
            <h1>🔐 Đặt lại mật khẩu</h1>
            <p class="greeting">Xin chào <strong>${fullName}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã OTP bên dưới để tiếp tục:</p>
            
            <div class="otp-box">
              <div class="otp-label">Mã OTP của bạn:</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="warning">
              <div class="warning-title">⏰ Lưu ý quan trọng:</div>
              <ul>
                <li>Mã OTP này sẽ <strong>hết hạn sau 5 phút</strong></li>
                <li>Bạn có tối đa <strong>3 lần nhập</strong> mã OTP</li>
                <li>Nếu không phải bạn yêu cầu, vui lòng <strong>bỏ qua email này</strong></li>
              </ul>
            </div>
            
            <div class="security-note">
              🔒 <strong>Bảo mật:</strong> Không chia sẻ mã OTP này với bất kỳ ai, kể cả nhân viên Bear English.
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động từ hệ thống Bear English.</p>
              <p>Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.</p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
                © 2025 Bear English. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bear English - Đặt lại mật khẩu

Xin chào ${fullName},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Mã OTP của bạn: ${otp}

Lưu ý:
- Mã này sẽ hết hạn sau 5 phút
- Bạn có tối đa 3 lần nhập mã OTP
- Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này

Không chia sẻ mã OTP này với bất kỳ ai.

---
Bear English Learning App
© 2025 All rights reserved.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Reset password OTP đã được gửi đến:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi gửi reset password OTP:", error);
    return { success: false, error };
  }
};

// @desc    Đăng ký tài khoản mới (Web - với link xác nhận)
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    const user = new User({
      email,
      password,
      fullName,
      phoneNumber,
    });

    const verificationToken = user.generateVerificationToken();
    await user.save();

    const emailResult = await sendVerificationEmail(
      email,
      verificationToken,
      fullName
    );

    const token = generateToken(user._id);

    let message =
      "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.";
    if (!emailResult.success) {
      message =
        "Đăng ký thành công, nhưng không thể gửi email xác nhận. Vui lòng thử lại sau.";
    }

    res.status(201).json({
      success: true,
      message: message,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
      error: error.message,
    });
  }
};

// @desc    Đăng ký tài khoản mới (Mobile - với OTP)
// @route   POST /api/users/register-mobile
// @access  Public
exports.registerMobile = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    console.log("Register mobile request body:", req.body);

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email, mật khẩu và họ tên là bắt buộc",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName,
      phoneNumber,
    });

    // Generate OTP (6 số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = crypto.createHash("sha256").update(otp).digest("hex");
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    console.log("Generated OTP:", otp);
    console.log("Hashed OTP saved:", user.otpCode);

    await user.save();

    const emailResult = await sendOTPEmail(email, otp, fullName);

    let message = "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.";
    if (!emailResult.success) {
      message =
        "Đăng ký thành công, nhưng không thể gửi email OTP. Vui lòng thử lại sau.";
    }

    res.status(201).json({
      success: true,
      message: message,
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký mobile:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
      error: error.message,
    });
  }
};

// @desc    Xác nhận OTP
// @route   POST /api/users/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Verify OTP request:", { email, otp });

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mã OTP",
      });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    console.log("Hashed OTP:", hashedOTP);

    const user = await User.findOne({
      email: email.toLowerCase(),
      otpCode: hashedOTP,
      otpExpire: { $gt: Date.now() },
    });

    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      // Debug: kiểm tra user có tồn tại không
      const userExists = await User.findOne({ email: email.toLowerCase() });
      console.log("User exists:", userExists ? "Yes" : "No");
      if (userExists) {
        console.log("Stored OTP code:", userExists.otpCode);
        console.log("OTP expire:", userExists.otpExpire);
        console.log("Current time:", Date.now());
        console.log("Is expired:", userExists.otpExpire < Date.now());
      }

      return res.status(400).json({
        success: false,
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
      });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Xác nhận OTP thành công",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Lỗi xác nhận OTP:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác nhận OTP",
      error: error.message,
    });
  }
};

// @desc    Gửi lại OTP
// @route   POST /api/users/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với email này",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email đã được xác nhận",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = crypto.createHash("sha256").update(otp).digest("hex");
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(email, otp, user.fullName);

    res.status(200).json({
      success: true,
      message: "Mã OTP mới đã được gửi",
    });
  } catch (error) {
    console.error("Lỗi gửi lại OTP:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi lại OTP",
      error: error.message,
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
};

// @desc    Xác nhận email (link)
// @route   GET /api/users/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token xác nhận không hợp lệ hoặc đã hết hạn",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Email đã được xác nhận thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác nhận email",
      error: error.message,
    });
  }
};

// @desc    Gửi lại email xác nhận
// @route   POST /api/users/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với email này",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email đã được xác nhận",
      });
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(email, verificationToken, user.fullName);

    res.status(200).json({
      success: true,
      message: "Email xác nhận đã được gửi lại",
    });
  } catch (error) {
    console.error("Lỗi gửi lại email:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi lại email xác nhận",
      error: error.message,
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin user",
      error: error.message,
    });
  }
};

// @desc    Cập nhật thông tin user
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật profile",
      error: error.message,
    });
  }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const user = await User.findById(req.user.id);

    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
};

// ============ ADMIN ROUTES ============

// @desc    Lấy danh sách tất cả người dùng (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

// @desc    Cập nhật thông tin user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { fullName, phoneNumber, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật người dùng",
      error: error.message,
    });
  }
};

// @desc    Xóa user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Không cho phép xóa chính mình
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa tài khoản của chính bạn",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa người dùng",
      error: error.message,
    });
  }
};

// @desc    Toggle verification status (Admin)
// @route   PATCH /api/users/:id/toggle-verification
// @access  Private/Admin
exports.toggleVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Đã ${user.isVerified ? "xác thực" : "hủy xác thực"} người dùng`,
      data: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Lỗi toggle verification:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thay đổi trạng thái xác thực",
      error: error.message,
    });
  }
};

// Gửi email thông tin tài khoản admin mới
const sendAdminAccountEmail = async (email, password, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Tài khoản Admin - BearEnglish",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Chào mừng Admin ${fullName}!</h2>
        <p>Tài khoản admin của bạn đã được tạo thành công.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Mật khẩu tạm thời:</strong> <span style="color: #4CAF50; font-size: 18px; font-weight: bold;">${password}</span></p>
        </div>
        <p style="color: #f44336;"><strong>⚠️ Lưu ý bảo mật:</strong></p>
        <ul style="color: #666;">
          <li>Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu</li>
          <li>Không chia sẻ thông tin này với bất kỳ ai</li>
          <li>Email này sẽ tự động bị xóa sau 24 giờ</li>
        </ul>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Email này chứa thông tin nhạy cảm. Vui lòng xóa sau khi lưu thông tin đăng nhập.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email tài khoản admin đã được gửi đến:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi gửi email tài khoản admin:", error);
    return { success: false, error };
  }
};

// @desc    Tạo tài khoản admin mới (Admin)
// @route   POST /api/users/create-admin
// @access  Private/Admin
exports.createAdminAccount = async (req, res) => {
  try {
    const { email, fullName, phoneNumber } = req.body;

    // Validation
    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email và họ tên là bắt buộc",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Generate mật khẩu ngẫu nhiên (8 ký tự: chữ hoa, chữ thường, số, ký tự đặc biệt)
    const generatePassword = () => {
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const special = "!@#$%^&*";
      const allChars = uppercase + lowercase + numbers + special;

      let password = "";
      // Đảm bảo có ít nhất 1 ký tự mỗi loại
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += special[Math.floor(Math.random() * special.length)];

      // Thêm 4 ký tự ngẫu nhiên nữa
      for (let i = 0; i < 4; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }

      // Shuffle password
      return password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
    };

    const generatedPassword = generatePassword();

    // Tạo user mới với role admin và isVerified = true
    const user = new User({
      email: email.toLowerCase(),
      password: generatedPassword,
      fullName,
      phoneNumber,
      role: "admin",
      isVerified: true, // Admin account được verify sẵn
    });

    await user.save();

    // Gửi email thông tin tài khoản
    const emailResult = await sendAdminAccountEmail(
      email,
      generatedPassword,
      fullName
    );

    if (!emailResult.success) {
      // Nếu gửi email thất bại, vẫn tạo tài khoản nhưng trả về cả mật khẩu
      return res.status(201).json({
        success: true,
        message:
          "Tạo tài khoản admin thành công, nhưng không thể gửi email. Vui lòng lưu mật khẩu này:",
        data: {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isVerified: user.isVerified,
          },
          temporaryPassword: generatedPassword,
        },
      });
    }

    res.status(201).json({
      success: true,
      message:
        "Tạo tài khoản admin thành công! Thông tin đã được gửi qua email.",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi tạo tài khoản admin:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo tài khoản admin",
      error: error.message,
    });
  }
};

// ============ RESET PASSWORD ROUTES ============

// Store OTP cho reset password trong memory (production nên dùng Redis)
const resetPasswordOTPStore = new Map();

// @desc    Gửi OTP reset password
// @route   POST /api/users/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này",
      });
    }

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP với thời gian hết hạn (5 phút)
    resetPasswordOTPStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    // Gửi email OTP
    const emailResult = await sendResetPasswordOTP(email, otp, user.fullName);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email OTP. Vui lòng thử lại sau.",
      });
    }

    console.log(`📧 Reset password OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn",
      // Chỉ để test, xóa dòng này trong production
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Lỗi forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý yêu cầu",
      error: error.message,
    });
  }
};

// @desc    Verify OTP reset password
// @route   POST /api/users/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email và OTP là bắt buộc",
      });
    }

    const otpData = resetPasswordOTPStore.get(email.toLowerCase());

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP không tồn tại hoặc đã hết hạn",
      });
    }

    // Kiểm tra số lần thử
    if (otpData.attempts >= 3) {
      resetPasswordOTPStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "Đã vượt quá số lần nhập OTP. Vui lòng yêu cầu mã mới.",
      });
    }

    // Kiểm tra hết hạn
    if (Date.now() > otpData.expiresAt) {
      resetPasswordOTPStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
      });
    }

    // Kiểm tra OTP đúng
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Mã OTP không đúng",
        remainingAttempts: 3 - otpData.attempts,
      });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Lưu reset token vào store (thay thế OTP data)
    resetPasswordOTPStore.set(email.toLowerCase(), {
      resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes để reset password
      verified: true,
    });

    res.json({
      success: true,
      message: "Xác thực OTP thành công",
      resetToken,
    });
  } catch (error) {
    console.error("Lỗi verify reset OTP:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực OTP",
      error: error.message,
    });
  }
};

// @desc    Reset password với token
// @route   POST /api/users/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const resetData = resetPasswordOTPStore.get(email.toLowerCase());

    if (
      !resetData ||
      !resetData.verified ||
      resetData.resetToken !== resetToken
    ) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Kiểm tra hết hạn
    if (Date.now() > resetData.expiresAt) {
      resetPasswordOTPStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "Token đã hết hạn. Vui lòng thử lại.",
      });
    }

    // Tìm user và update password
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    user.password = newPassword;
    await user.save();

    // Xóa reset token
    resetPasswordOTPStore.delete(email.toLowerCase());

    console.log(`✅ Password reset successfully for ${email}`);

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.",
    });
  } catch (error) {
    console.error("Lỗi reset password:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đặt lại mật khẩu",
      error: error.message,
    });
  }
};

// @desc    Resend OTP reset password
// @route   POST /api/users/resend-reset-otp
// @access  Public
exports.resendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này",
      });
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP mới
    resetPasswordOTPStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // Gửi email OTP
    const emailResult = await sendResetPasswordOTP(email, otp, user.fullName);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email OTP. Vui lòng thử lại sau.",
      });
    }

    console.log(`📧 Resend reset password OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "Mã OTP mới đã được gửi",
      // Chỉ để test
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Lỗi resend reset OTP:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi lại OTP",
      error: error.message,
    });
  }
};
