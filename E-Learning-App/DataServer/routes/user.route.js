// routes/user.route.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", userController.register);
router.post("/register-mobile", userController.registerMobile);
router.post("/login", userController.login);
router.get("/verify-email/:token", userController.verifyEmail);
router.post("/verify-otp", userController.verifyOTP);
router.post("/resend-verification", userController.resendVerification);
router.post("/resend-otp", userController.resendOTP);

// Reset password routes
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-reset-otp", userController.verifyResetOTP);
router.post("/reset-password", userController.resetPassword);
router.post("/resend-reset-otp", userController.resendResetOTP);

// Protected routes
router.get("/me", protect, userController.getMe);
router.put("/me", protect, userController.updateProfile);
router.put("/change-password", protect, userController.changePassword);

// Admin routes
router.get("/", protect, userController.getAllUsers);
router.post("/create-admin", protect, userController.createAdminAccount);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);
router.patch(
  "/:id/toggle-verification",
  protect,
  userController.toggleVerification
);

module.exports = router;
