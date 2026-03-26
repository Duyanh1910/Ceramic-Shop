import ErrorHandler from "../utils/error_handler.js";
import crypto from "crypto";
import axios from "axios";

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
      title = "Khôi phục mật khẩu";
      description = "Bạn đã yêu cầu khôi phục mật khẩu.";
      warning = "Nếu không phải bạn, hãy bỏ qua email này.";
    } else {
      mailSubject = "[The Ceramic Shop] Mã OTP xác thực";
      title = "Xác thực tài khoản";
      description = "Bạn vừa yêu cầu mã OTP.";
      warning = "Nếu không phải bạn, hãy bỏ qua.";
    }

    const htmlContent = `
<div style="margin:0;padding:0;background:#f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:20px 0;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;font-family:Arial,sans-serif;">
          
          <tr>
            <td style="background:#1f4e79;color:#ffffff;text-align:center;padding:20px;">
              <h2 style="margin:0;">The Ceramic Shop</h2>
              <p style="margin:5px 0 0;font-size:14px;">${title}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:30px;text-align:center;color:#333;">
              <h3 style="margin-top:0;">Xin chào 👋</h3>
              <p>${description}</p>
              <p>Vui lòng sử dụng mã OTP dưới đây:</p>

              <div style="
                font-size:34px;
                font-weight:bold;
                letter-spacing:8px;
                background:#eef5ff;
                padding:15px 30px;
                display:inline-block;
                border-radius:8px;
                margin:20px 0;
                color:#1f4e79;
              ">
                ${otp}
              </div>

              <p>Mã OTP sẽ hết hạn sau <b>5 phút</b>.</p>

              <p style="color:#888;font-size:13px;margin-top:20px;">
                ${warning}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f0f0f0;text-align:center;padding:15px;font-size:12px;color:#777;">
              © ${new Date().getFullYear()} The Ceramic Shop<br/>
              Đây là email tự động, vui lòng không trả lời.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>
`;

    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "The Ceramic Shop",
          email: "phap96130@st.vimaru.edu.vn",
        },
        to: [{ email }],
        subject: mailSubject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Email sent:", res.data);
    return otp;
  } catch (err) {
    console.error("Send mail error:", err.response?.data || err);
    throw new ErrorHandler("Không gửi được email!", 500);
  }
};
