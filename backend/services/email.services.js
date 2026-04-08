import ErrorHandler from "../utils/error_handler.js";
import crypto from "crypto";
import axios from "axios";
import {
  ProductModel,
  VariantModel,
  OrderDetailModel,
  OrderModel,
  CustomerModel,
  PaymentMethodModel,
  PaymentTransactionModel,
  PromotionModel,
  ShippingTypeModel,
} from "../models/index.js";

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
          name: process.env.BREVO_SENDER_NAME || "The Ceramic Shop",
          email: process.env.BREVO_SENDER_EMAIL,
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

export const sendEmailInvoiceService = async (email, orderCode) => {
  try {
    if (!orderCode) {
      throw new ErrorHandler("Mã đơn hàng không hợp lệ!", 400);
    }
    const order = await OrderModel.findOne({
      where: {
        MaHienThi: orderCode,
        TrangThaiThanhToan: 1,
      },
      include: [
        {
          model: OrderDetailModel,
          include: [
            {
              model: VariantModel,
              attributes: ["TenBienThe"],
              include: [
                {
                  model: ProductModel,
                  attributes: ["TenSanPham"],
                },
              ],
            },
          ],
        },
        {
          model: PromotionModel,
          through: { attributes: ["SoTienChietKhau"] },
        },
        { model: ShippingTypeModel, attributes: ["TenLoaiPhi"] },
        {
          model: PaymentMethodModel,
          attributes: ["TenPhuongThuc"],
        },
        {
          model: CustomerModel,
          attributes: ["TenKhachHang"],
        },
      ],
    });

    if (!order) {
      throw new ErrorHandler("Không tìm thấy đơn hàng này!", 404);
    }

    const customerName = order.CustomerModel?.TenKhachHang || "Quý khách";
    const receiverName = order.TenNguoiNhan || customerName;
    const receiverPhone = order.SDT || "Không cung cấp";
    const shippingAddress = order.DiaChiGiaoHang || "Nhận tại cửa hàng";
    const orderNote = order.GhiChu
      ? `<strong>Ghi chú:</strong> ${order.GhiChu}`
      : "";

    const orderDate = new Date(order.NgayDat || new Date()).toLocaleDateString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount || 0);
    };

    const logo =
      "https://res.cloudinary.com/dcmwz0uis/image/upload/v1774819165/IMG_20260330_041641_qwo8lc.jpg";
    let mailSubject = `[The Ceramic Shop] Xác nhận đơn hàng #${orderCode}`;
    let title = "Cảm ơn bạn đã đặt hàng tại The Ceramic Shop!";

    const chiTietDonHangs =
      order.ChiTietDonHangs || order.OrderDetailModels || [];

    const orderItemsHtml = chiTietDonHangs
      .map(
        (item) => `
  <tr>
    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333;">
      <strong>${item.Variant?.Product?.TenSanPham || item.BienTheSanPham?.SanPham?.TenSanPham || "Sản phẩm"}</strong> <br/>
      <span style="color: #7f8c8d; font-size: 13px;">Phân loại: ${item.Variant?.TenBienThe || item.BienTheSanPham?.TenBienThe || "Mặc định"}</span>
      ${item.GhiChu ? `<br/><span style="color: #e67e22; font-size: 12px;">* ${item.GhiChu}</span>` : ""}
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center; color: #333333;">${item.SoLuong || 1}</td>
    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #333333;">${formatCurrency(item.GiaBan || item.GiaTien)}</td>
    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #333333;"><b>${formatCurrency(item.ThanhTien)}</b></td>
  </tr>
`,
      )
      .join("");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
          <td align="center">
            <table width="650" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin: 0 auto; max-width: 650px;">
              
              <tr>
                <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 3px solid #d4a373;">
                  <img src="${logo}" alt="The Ceramic Shop" style="max-width: 140px; height: auto; border-radius: 4px;">
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px 40px;">
                  <h2 style="color: #2c3e50; font-size: 24px; margin-top: 0; margin-bottom: 15px; text-align: center;">${title}</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <b>${customerName}</b>,<br/>
                    Chúng tôi đã nhận được đơn đặt hàng của bạn và đang tiến hành xử lý. Dưới đây là thông tin chi tiết về đơn hàng của bạn:
                  </p>

                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                    <tr>
                      <td width="48%" valign="top" style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #eeeeee;">
                        <h3 style="margin-top: 0; color: #2c3e50; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Chi tiết đơn hàng</h3>
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 0;">
                          <strong>Mã đơn:</strong> <span style="color: #d4a373; font-weight: bold;">#${orderCode}</span><br>
                          <strong>Ngày đặt:</strong> ${orderDate}<br>
                          <strong>Thanh toán:</strong> ${order.PaymentMethod?.TenPhuongThuc || "N/A"}<br>
                          <strong>Vận chuyển:</strong> ${order.ShippingType?.TenLoaiPhi || "N/A"}
                        </p>
                      </td>
                      <td width="4%"></td> <td width="48%" valign="top" style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #eeeeee;">
                        <h3 style="margin-top: 0; color: #2c3e50; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Thông tin nhận hàng</h3>
                        <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 0;">
                          <strong>Người nhận:</strong> ${receiverName}<br>
                          <strong>Số điện thoại:</strong> ${receiverPhone}<br>
                          <strong>Địa chỉ:</strong> ${shippingAddress}
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  ${orderNote ? `<p style="background-color: #fff3cd; padding: 10px 15px; border-radius: 4px; color: #856404; font-size: 14px; border-left: 4px solid #ffeeba;">${orderNote}</p>` : ""}

                  <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #f4f4f5; padding-bottom: 5px;">Danh sách sản phẩm</h3>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                      <tr style="background-color: #faebd7;"> <th style="padding: 12px; text-align: left; color: #2c3e50; font-size: 14px; border-top-left-radius: 6px;">Sản phẩm</th>
                        <th style="padding: 12px; text-align: center; color: #2c3e50; font-size: 14px;">SL</th>
                        <th style="padding: 12px; text-align: right; color: #2c3e50; font-size: 14px;">Đơn giá</th>
                        <th style="padding: 12px; text-align: right; color: #2c3e50; font-size: 14px; border-top-right-radius: 6px;">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${orderItemsHtml}
                    </tbody>
                  </table>

                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                    <tr>
                      <td align="right" style="padding: 5px 12px; color: #555555; font-size: 14px;">Tổng tiền hàng:</td>
                      <td align="right" width="130" style="padding: 5px 12px; color: #333333; font-size: 14px;">${formatCurrency(order.TongTienHang)}</td>
                    </tr>
                    <tr>
                      <td align="right" style="padding: 5px 12px; color: #555555; font-size: 14px;">Phí vận chuyển:</td>
                      <td align="right" style="padding: 5px 12px; color: #333333; font-size: 14px;">${formatCurrency(order.TongPhiVanChuyen)}</td>
                    </tr>
                    ${
                      order.TongGiamGia > 0
                        ? `
                    <tr>
                      <td align="right" style="padding: 5px 12px; color: #e74c3c; font-size: 14px;">Chiết khấu/Voucher:</td>
                      <td align="right" style="padding: 5px 12px; color: #e74c3c; font-size: 14px;">- ${formatCurrency(order.TongGiamGia)}</td>
                    </tr>`
                        : ""
                    }
                    <tr>
                      <td align="right" style="padding: 15px 12px 5px; color: #2c3e50; font-size: 16px; font-weight: bold; border-top: 1px solid #eeeeee;">TỔNG THANH TOÁN:</td>
                      <td align="right" style="padding: 15px 12px 5px; color: #d4a373; font-size: 20px; font-weight: bold; border-top: 1px solid #eeeeee;">${formatCurrency(order.TongThanhToan)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td align="center" style="padding: 25px 20px; background-color: #2c3e50; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="color: #ecf0f1; font-size: 14px; margin: 0 0 10px 0;">
                    Cần hỗ trợ? Hãy liên hệ với chúng tôi qua Hotline: <strong>0123 456 789</strong>
                  </p>
                  <p style="color: #95a5a6; font-size: 12px; line-height: 1.5; margin: 0;">
                    Chú ý: Đây là email tự động từ hệ thống, vui lòng không phản hồi (reply) email này.<br>
                    &copy; 2026 The Ceramic Shop. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || "The Ceramic Shop",
          email: process.env.BREVO_SENDER_EMAIL,
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
    console.log(`Gửi email hóa đơn thành công cho ${email}`);
    return true;
  } catch (err) {
    console.error("Send mail error:", err.response?.data || err);
    throw new ErrorHandler("Không gửi được email!", 500);
  }
};
