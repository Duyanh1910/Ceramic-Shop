import redisClient from "../config/redis.config.js";
import { sendEmailVerifyService } from "../services/email.services.js";
import ErrorHandler from "../utils/error_handler.js";

export const sendVerifyEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler("Email không hợp lệ", 400));
    }
    const cooldown = await redisClient.get(`otp_cooldown:${email}`);
    if (cooldown) {
      return next(
        new ErrorHandler("Vui lòng đợi mã OTP mới sau 60 giây!", 429),
      );
    }
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
