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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const oauthFailureRedirect = (provider, err, res) => {
  if (err) {
    console.error(`${provider} OAuth failed:`, {
      message: err.message,
      type: err.type,
      code: err.code,
      subcode: err.subcode,
      status: err.status,
      traceID: err.traceID,
    });
  }

  const reason =
    err?.subcode === 36009 ||
    err?.message === "This authorization code has been used."
      ? "code_already_used"
      : "oauth_failed";

  return res.redirect(`${FRONTEND_URL}/login?error=${reason}`);
};

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
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err || !user) {
        return oauthFailureRedirect("Google", err, res);
      }
      req.user = user;
      return next();
    })(req, res, next);
  },
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
  (req, res, next) => {
    passport.authenticate("facebook", { session: false }, (err, user) => {
      if (err || !user) {
        return oauthFailureRedirect("Facebook", err, res);
      }
      req.user = user;
      return next();
    })(req, res, next);
  },
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
