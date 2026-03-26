import redisClient from "../config/redis.config.js";
import { sendEmailVerifyService } from "../services/email.services.js";
import { isValidEmail } from "../utils/helpers.js";
import ErrorHandler from "../utils/error_handler.js";

export const sendVerifyEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return next(new ErrorHandler("Email không hợp lệ", 400));
    }
    const normalizedEmail = email.trim().toLowerCase();
    const cooldown = await redisClient.get(`otp_cooldown:${normalizedEmail}`);
    if (cooldown) {
      return next(
        new ErrorHandler("Vui lòng đợi mã OTP mới sau 60 giây!", 429),
      );
    }
    await redisClient.del(`otp_attempts:${normalizedEmail}`);
    const otp = await sendEmailVerifyService(normalizedEmail);
    await redisClient.set(`otp_cooldown:${normalizedEmail}`, "1", {
      ex: 60,
    });
    await redisClient.set(`otp_verify:${normalizedEmail}`, otp, {
      ex: 300,
    });
    return res.status(200).json({
      success: true,
      message: "OTP đã được gửi tới email",
    });
  } catch (err) {
    next(err);
  }
};

export const VerifyEmailController = async (req, res, next) => {
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
    return res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
