import redisClient from "../config/redis.config.js";
import { AccountModel } from "../models/index.js";
import { sendEmailVerifyService } from "../services/email.services.js";
import ErrorHandler from "../utils/error_handler.js";
import { checkValidate, isValidEmail } from "../utils/helpers.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return next(new ErrorHandler("Email không hợp lệ", 400));
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await AccountModel.findOne({ where: { Email: email } });
    if (!user) {
      return next(new ErrorHandler("Email không tồn tại trong hệ thống!", 404));
    }

    const cooldown = await redisClient.get(`otp_cooldown:${normalizedEmail}`);
    if (cooldown)
      return next(
        new ErrorHandler("Vui lòng đợi mã OTP mới sau 60 giây!", 429),
      );

    await redisClient.del(`otp_attempts:${normalizedEmail}`);
    const otp = await sendEmailVerifyService(email, "forgot_password");

    await redisClient.set(`otp_cooldown:${normalizedEmail}`, "1", { ex: 60 });
    await redisClient.set(`otp_verify:${normalizedEmail}`, otp, { ex: 300 });

    return res
      .status(200)
      .json({ success: true, message: "OTP khôi phục mật khẩu đã được gửi" });
  } catch (err) {
    next(err);
  }
};

export const verifyOTPResetPasswordController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !isValidEmail(email)) {
      return next(new ErrorHandler("Email không hợp lệ", 400));
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!otp) {
      return next(new ErrorHandler("OTP không hợp lệ", 400));
    }
    const attempts = parseInt(
      (await redisClient.get(`otp_attempts:${normalizedEmail}`)) || "0",
    );
    if (attempts >= 5) {
      const ttl = await redisClient.ttl(`otp_attempts:${normalizedEmail}`);
      return next(
        new ErrorHandler("Nhập OTP quá nhiều lần, vui lòng thử lại sau!", 429, {
          retryAfter: ttl > 0 ? ttl : 0,
        }),
      );
    }
    const formatOtp = String(otp).padStart(6, "0");
    const savedOTP = await redisClient.get(`otp_verify:${normalizedEmail}`);
    if (!savedOTP) {
      return next(
        new ErrorHandler("Mã OTP này đã hết hạn hoặc không hợp lệ!", 400),
      );
    }
    if (savedOTP !== formatOtp) {
      const newAtmp = await redisClient.incr(`otp_attempts:${normalizedEmail}`);
      if (newAtmp === 1) {
        await redisClient.expire(`otp_attempts:${normalizedEmail}`, 300);
      }
      return next(
        new ErrorHandler("Mã OTP không hợp lệ!", 400, {
          remainingAttempts: Math.max(5 - newAtmp, 0),
        }),
      );
    }
    await redisClient.del(
      `otp_verify:${normalizedEmail}`,
      `otp_cooldown:${normalizedEmail}`,
      `otp_attempts:${normalizedEmail}`,
    );

    const resetToken = crypto.randomBytes(32).toString("hex");
    await redisClient.set(`reset_token:${normalizedEmail}`, resetToken, {
      ex: 600,
    });

    return res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công, vui lòng nhập mật khẩu mới!",
      resetToken: resetToken,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { resetToken, email, newPassword } = req.body;

    if (!checkValidate(resetToken, email, newPassword)) {
      return next(new ErrorHandler("Vui lòng nhập đầy đủ thông tin!", 400));
    }
    if (newPassword.length < 6) {
      return next(new ErrorHandler("Mật khẩu phải dài hơn 6 ký tự!", 400));
    }
    if (!email || !isValidEmail(email)) {
      return next(new ErrorHandler("Email không hợp lệ", 400));
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await AccountModel.findOne({
      where: {
        Email: email,
      },
    });
    if (!user) {
      return next(new ErrorHandler("Không tồn tại gmail này!", 404));
    }
    const savedToken = await redisClient.get(`reset_token:${normalizedEmail}`);
    if (!savedToken || savedToken !== resetToken) {
      return next(
        new ErrorHandler(
          "Phiên đổi mật khẩu đã hết hạn hoặc không hợp lệ!",
          403,
        ),
      );
    }
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashed_password = await bcrypt.hash(newPassword, saltRounds);
    await AccountModel.update(
      {
        Password: hashed_password,
      },
      {
        where: {
          MaTaiKhoan: user.MaTaiKhoan,
        },
      },
    );
    await redisClient.del(`reset_token:${normalizedEmail}`);
    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu mới thành công!",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
