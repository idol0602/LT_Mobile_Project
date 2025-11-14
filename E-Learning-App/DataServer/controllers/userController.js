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
