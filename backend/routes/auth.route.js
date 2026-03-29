import express from "express";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import {
  login,
  customerRegister,
  getMe,
  changePasswordController,
  facebookCallbackController,
  googleCallbackController,
} from "../controllers/auth.controller.js";
import passport from "../config/passport.js";
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

router.get("/google", (req, res, next) => {
  const rememberMe = req.query.rememberMe || "false";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: rememberMe,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/fail",
  }),
  googleCallbackController,
);

router.get("/facebook", (req, res, next) => {
  const rememberMe = req.query.rememberMe || "false";
  passport.authenticate("facebook", {
    scope: ["email"],
    state: rememberMe,
  })(req, res, next);
});

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/api/auth/fail",
  }),
  facebookCallbackController,
);

router.get("/fail", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Xác thực qua mạng xã hội thất bại!",
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.status(200).json({ success: true, message: "Đăng xuất thành công!" });
});

export default router;


