// models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email không hợp lệ",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpire: {
      type: Date,
    },
    otpCode: {
      type: String,
    },
    otpExpire: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  // Chỉ hash mật khẩu khi nó được modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method để generate verification token
userSchema.methods.generateVerificationToken = function () {
  const crypto = require("crypto");
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Lưu hashed token vào DB
  this.verificationToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Set thời gian hết hạn
  this.verificationTokenExpire = Date.now() + 3600000; // 1 giờ

  return rawToken;
};

// Method để generate reset password token
userSchema.methods.generateResetPasswordToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpire = Date.now() + 3600000; // 1 giờ
  return token;
};

module.exports = mongoose.model("User", userSchema);
