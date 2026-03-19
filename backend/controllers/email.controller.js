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
    const cooldown = await redisClient.get(`otp_cooldown:${email}`);
    if (cooldown) {
      return next(
        new ErrorHandler("Vui lòng đợi mã OTP mới sau 60 giây!", 429),
      );
    }
    await redisClient.del(`otp_attempts:${email}`);
    const otp = await sendEmailVerifyService(email);
    await redisClient.set(`otp_cooldown:${email}`, "1", {
      EX: 60,
    });
    await redisClient.set(`otp_verify:${email}`, otp, {
      EX: 300,
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
    if (!otp) {
      return next(new ErrorHandler("OTP không hợp lệ", 400));
    }
    const attempts = parseInt(
      (await redisClient.get(`otp_attempts:${email}`)) || "0",
    );
    if (attempts >= 5) {
      const ttl = await redisClient.ttl(`otp_attempts:${email}`);
      return next(
        new ErrorHandler("Nhập OTP quá nhiều lần, vui lòng thử lại sau!", 429, {
          retryAfter: ttl > 0 ? ttl : 0,
        }),
      );
    }
    const formatOtp = String(otp).padStart(6, "0");
    const savedOTP = await redisClient.get(`otp_verify:${email}`);
    if (!savedOTP) {
      return next(
        new ErrorHandler("Mã OTP này đã hết hạn hoặc không hợp lệ!", 400),
      );
    }
    if (savedOTP !== formatOtp) {
      const newAtmp = await redisClient.incr(`otp_attempts:${email}`);
      if (newAtmp === 1) {
        await redisClient.expire(`otp_attempts:${email}`, 300);
      }
      return next(
        new ErrorHandler("Mã OTP không hợp lệ!", 400, {
          remainingAttempts: Math.max(5 - newAtmp, 0),
        }),
      );
    }
    await redisClient.del([
      `otp_verify:${email}`,
      `otp_cooldown:${email}`,
      `otp_attempts:${email}`,
    ]);
    return res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
