import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  sendVerificationCode,
  verifySignupOtp,
  resendVerificationCode,
  login,
  signup,
  getMe,
  verifyStudentEmailForSignup
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup",signup);
router.get("/verifyToken", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-code", verifySignupOtp);
router.post("/resend-code", resendVerificationCode);

// Student email verification before signup
router.post("/verify-student-email", verifyStudentEmailForSignup);

// Get logged-in user's details
router.get("/users/me", verifyToken, getMe);

export default router;
