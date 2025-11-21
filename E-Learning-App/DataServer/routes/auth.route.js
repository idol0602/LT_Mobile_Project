const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Forgot Password Flow
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOTP);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-otp", authController.resendOTP);

module.exports = router;
