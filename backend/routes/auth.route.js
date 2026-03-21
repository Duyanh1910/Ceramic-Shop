import express from "express";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import {
  login,
  customerRegister,
  getMe,
  changePasswordController,
} from "../controllers/auth.controller.js";

import {
  sendVerifyEmailController,
  VerifyEmailController,
} from "../controllers/email.controller.js";

import {
  verifyOTPResetPasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/forgotPassword.controller.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", customerRegister);

router.get("/me", jwtMiddleware, getMe);

router.post("/sendVerifyEmail", sendVerifyEmailController);
router.post("/VerifyEmail", VerifyEmailController);

router.post("/forgot-password", forgotPasswordController);
router.post("/verify-reset-otp", verifyOTPResetPasswordController);
router.post("/reset-password", resetPasswordController);

router.post("/change-password", jwtMiddleware, changePasswordController);
export default router;
