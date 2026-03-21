import ErrorHandler from "../utils/error_handler.js";
import transporter from "../config/mail.config.js";
import crypto from "crypto";

export const sendEmailVerifyService = async (email, type = "verify") => {
  try {
    const raw = crypto.randomInt(0, 1000000);
    const otp = raw.toString().padStart(6, "0");

    let mailSubject = "";
    let title = "";
    let description = "";
    let warning = "";

    if (type === "forgot_password") {
      mailSubject = "[The Ceramic Shop] Mã OTP Khôi phục mật khẩu";
      title = "Khôi phục mật khẩu của bạn";
      description =
        "Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.";
      warning =
        "CẢNH BÁO: Nếu bạn không yêu cầu đổi mật khẩu, tài khoản của bạn có thể đang gặp rủi ro. Vui lòng bỏ qua email này và không chia sẻ mã OTP cho bất kỳ ai.";
    } else {
      mailSubject = "[The Ceramic Shop] Mã xác thực OTP của bạn";
      title = "Xác thực danh tính của bạn";
      description = "Bạn vừa yêu cầu mã xác thực cho tài khoản của mình.";
      warning = "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.";
    }

    const info = await transporter.sendMail({
      from: `"The Ceramic Shop" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: mailSubject,
      html: `
<div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px 0;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
    
    <div style="background:#1f4e79; color:#fff; padding:20px; text-align:center;">
      <h2 style="margin:0;">The Ceramic Shop</h2>
      <p style="margin:5px 0 0; font-size:14px;">${title}</p>
    </div>

    <div style="padding:30px; text-align:center;">
      <h3>Xin chào!</h3>
      <p>${description}</p>
      <p>Vui lòng sử dụng mã OTP dưới đây:</p>

      <div style="
        font-size:32px;
        font-weight:bold;
        letter-spacing:6px;
        background:#f0f7ff;
        padding:15px 25px;
        display:inline-block;
        border-radius:6px;
        margin:20px 0;
        color:#1f4e79;
      ">
        ${otp}
      </div>

      <p>Mã OTP này sẽ hết hạn sau <b>5 phút</b>.</p>
      <p style="color:#d9534f; font-size:13px; font-weight:bold; margin-top:20px;">
        ${warning}
      </p>
    </div>

    <div style="background:#f5f5f5; padding:15px; text-align:center; font-size:12px; color:#777;">
      © ${new Date().getFullYear()} The Ceramic Shop  
      <br/>
      Email tự động - vui lòng không trả lời
    </div>

  </div>
</div>
`,
    });
    return otp;
  } catch (err) {
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể gửi mail!", 500);
  }
};
