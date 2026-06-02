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
  PromotionModel,
  ShippingTypeModel,
} from "../models/index.js";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

export const sendEmailVerifyService = async (email, type = "verify") => {
  try {
    const raw = crypto.randomInt(0, 1000000);
    const otp = raw.toString().padStart(6, "0");

    let mailSubject = "";
    let title = "";
    let description = "";
    let warning = "";

    if (type === "forgot_password") {
      mailSubject = "[The Ceramic Shop] Mã OTP khôi phục mật khẩu";
      title = "Khôi phục mật khẩu";
      description = "Bạn đã yêu cầu khôi phục mật khẩu.";
      warning = "Nếu không phải bạn, hãy bỏ qua email này.";
    } else if (type === "change_email") {
      mailSubject = "[The Ceramic Shop] Mã OTP xác thực đổi email";
      title = "Xác thực đổi email";
      description = "Bạn vừa yêu cầu cập nhật email tài khoản.";
      warning =
        "Nếu không phải bạn, hãy bỏ qua email này và đổi mật khẩu tài khoản.";
    } else {
      mailSubject = "[The Ceramic Shop] Mã OTP xác thực";
      title = "Xác thực tài khoản";
      description = "Bạn vừa yêu cầu mã OTP.";
      warning = "Nếu không phải bạn, hãy bỏ qua email này.";
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
              <h3 style="margin-top:0;">Xin chào</h3>
              <p>${description}</p>
              <p>Vui lòng sử dụng mã OTP dưới đây:</p>
              <div style="font-size:34px;font-weight:bold;letter-spacing:8px;background:#eef5ff;padding:15px 30px;display:inline-block;border-radius:8px;margin:20px 0;color:#1f4e79;">
                ${otp}
              </div>
              <p>Mã OTP sẽ hết hạn sau <b>5 phút</b>.</p>
              <p style="color:#888;font-size:13px;margin-top:20px;">${warning}</p>
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
        htmlContent,
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
      where: { MaHienThi: orderCode },
      include: [
        {
          model: OrderDetailModel,
          include: [
            {
              model: VariantModel,
              attributes: ["TenBienThe"],
              include: [{ model: ProductModel, attributes: ["TenSanPham"] }],
            },
          ],
        },
        {
          model: PromotionModel,
          through: { attributes: ["SoTienChietKhau"] },
        },
        { model: ShippingTypeModel, attributes: ["TenLoaiPhi"] },
        { model: PaymentMethodModel, attributes: ["TenPhuongThuc"] },
        { model: CustomerModel, attributes: ["TenKhachHang"] },
      ],
    });

    if (!order) {
      throw new ErrorHandler("Không tìm thấy đơn hàng này!", 404);
    }

    const orderDate = new Date(order.NgayDat || new Date()).toLocaleString(
      "vi-VN",
      {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    const paymentMethodName =
      order.PaymentMethodModel?.TenPhuongThuc ||
      order.PaymentMethod?.TenPhuongThuc ||
      "Thanh toán online";
    const shippingTypeName =
      order.ShippingTypeModel?.TenLoaiPhi ||
      order.ShippingType?.TenLoaiPhi ||
      "Giao hàng tiêu chuẩn";
    const customerName =
      order.CustomerModel?.TenKhachHang ||
      order.KhachHang?.TenKhachHang ||
      "Quý khách";
    const receiverName = order.TenNguoiNhan || customerName;
    const receiverPhone = order.SDT || "Không cung cấp";
    const shippingAddress = order.DiaChiGiaoHang || "Nhận tại cửa hàng";
    const orderNote = order.GhiChu
      ? `<strong>Ghi chú từ bạn:</strong> ${order.GhiChu}`
      : "";

    const orderItems =
      order.ChiTietDonHangs ||
      order.OrderDetailModels ||
      order.OrderDetails ||
      [];
    const orderItemsHtml = orderItems
      .map((item) => {
        const productName =
          item.Variant?.Product?.TenSanPham ||
          item.BienTheSanPham?.SanPham?.TenSanPham ||
          "Sản phẩm";
        const variantName =
          item.Variant?.TenBienThe ||
          item.BienTheSanPham?.TenBienThe ||
          "Mặc định";

        return `
      <tr>
        <td style="padding:15px;border-bottom:1px dashed #e0d5c1;color:#3e3222;">
          <strong style="font-size:15px;">${productName}</strong><br/>
          <span style="color:#8b7d6b;font-size:13px;">Phân loại: ${variantName}</span>
          ${item.GhiChu ? `<br/><span style="color:#c0392b;font-size:12px;font-style:italic;">* ${item.GhiChu}</span>` : ""}
        </td>
        <td style="padding:15px;border-bottom:1px dashed #e0d5c1;text-align:center;color:#5a4b3c;font-weight:500;">${item.SoLuong || 1}</td>
        <td style="padding:15px;border-bottom:1px dashed #e0d5c1;text-align:right;color:#5a4b3c;">${formatCurrency(item.GiaBan || item.GiaTien)}</td>
        <td style="padding:15px;border-bottom:1px dashed #e0d5c1;text-align:right;color:#b05c3c;font-weight:bold;">${formatCurrency(item.ThanhTien)}</td>
      </tr>`;
      })
      .join("");

    const promotions = order.PromotionModels || order.KhuyenMais || [];
    let promotionHtml = "";
    if (promotions.length > 0) {
      promotionHtml = promotions
        .map((promo) => {
          const discountAmount =
            promo.OrderPromotionModel?.SoTienChietKhau ||
            promo.ChiTietKhuyenMaiDonHang?.SoTienChietKhau ||
            0;
          return `
        <tr>
          <td align="right" style="padding:6px 12px;color:#c0392b;font-size:14px;">Voucher <strong style="text-transform:uppercase;">${promo.MaCode || promo.TenKhuyenMai || ""}</strong>:</td>
          <td align="right" style="padding:6px 12px;color:#c0392b;font-size:15px;font-weight:500;">- ${formatCurrency(discountAmount)}</td>
        </tr>`;
        })
        .join("");
    } else if (order.TongGiamGia > 0) {
      promotionHtml = `
        <tr>
          <td align="right" style="padding:6px 12px;color:#c0392b;font-size:14px;">Voucher / Chiết khấu:</td>
          <td align="right" style="padding:6px 12px;color:#c0392b;font-size:15px;font-weight:500;">- ${formatCurrency(order.TongGiamGia)}</td>
        </tr>`;
    }

    const logo =
      "https://res.cloudinary.com/dcmwz0uis/image/upload/v1774819165/IMG_20260330_041641_qwo8lc.jpg";
    const mailSubject = `[The Ceramic Shop] Xác nhận đơn hàng #${orderCode}`;
    const title = "Cảm ơn bạn đã tin chọn The Ceramic Shop!";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f5f2eb;margin:0;padding:30px 10px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f5f2eb;">
        <tr>
          <td align="center">
            <table width="680" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(90,75,60,0.08);margin:0 auto;max-width:680px;border:1px solid #e0d5c1;">
              <tr>
                <td align="center" style="padding:35px 20px;background-color:#ffffff;border-bottom:4px solid #b05c3c;">
                  <img src="${logo}" alt="The Ceramic Shop" style="max-width:160px;height:auto;border-radius:6px;">
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h2 style="color:#3e3222;font-size:26px;margin-top:0;margin-bottom:15px;text-align:center;letter-spacing:0.5px;">${title}</h2>
                  <p style="color:#5a4b3c;font-size:15px;line-height:1.6;margin-bottom:30px;text-align:center;">
                    Xin chào <strong style="color:#b05c3c;">${customerName}</strong>,<br/>
                    Đơn hàng của bạn đã được ghi nhận trên hệ thống và đang được xử lý chuẩn bị giao đến bạn.
                  </p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:25px;">
                    <tr>
                      <td width="48%" valign="top" style="background-color:#fdfaf6;padding:20px;border-radius:8px;border:1px solid #eadecb;">
                        <h3 style="margin-top:0;color:#3e3222;font-size:16px;border-bottom:2px solid #eadecb;padding-bottom:10px;text-transform:uppercase;letter-spacing:1px;">Chi tiết đơn</h3>
                        <p style="color:#5a4b3c;font-size:14px;line-height:1.9;margin:0;">
                          <strong style="color:#8b7d6b;">Mã đơn:</strong> <span style="color:#b05c3c;font-weight:bold;font-size:16px;">#${orderCode}</span><br>
                          <strong style="color:#8b7d6b;">Ngày đặt:</strong> ${orderDate}<br>
                          <strong style="color:#8b7d6b;">Thanh toán:</strong> ${paymentMethodName}<br>
                          <strong style="color:#8b7d6b;">Vận chuyển:</strong> ${shippingTypeName}
                        </p>
                      </td>
                      <td width="4%"></td>
                      <td width="48%" valign="top" style="background-color:#fdfaf6;padding:20px;border-radius:8px;border:1px solid #eadecb;">
                        <h3 style="margin-top:0;color:#3e3222;font-size:16px;border-bottom:2px solid #eadecb;padding-bottom:10px;text-transform:uppercase;letter-spacing:1px;">Giao hàng đến</h3>
                        <p style="color:#5a4b3c;font-size:14px;line-height:1.9;margin:0;">
                          <strong style="color:#8b7d6b;">Người nhận:</strong> <span style="font-weight:600;">${receiverName}</span><br>
                          <strong style="color:#8b7d6b;">Điện thoại:</strong> ${receiverPhone}<br>
                          <strong style="color:#8b7d6b;">Địa chỉ:</strong> ${shippingAddress}
                        </p>
                      </td>
                    </tr>
                  </table>
                  ${orderNote ? `<div style="background-color:#fff9e6;padding:12px 18px;border-radius:6px;color:#a67c00;font-size:14px;border-left:4px solid #ffcc00;margin-bottom:25px;">${orderNote}</div>` : ""}
                  <h3 style="color:#3e3222;font-size:18px;margin-bottom:15px;border-bottom:2px solid #eadecb;padding-bottom:8px;text-transform:uppercase;letter-spacing:1px;">Danh sách sản phẩm</h3>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:20px;background-color:#ffffff;">
                    <thead>
                      <tr style="background-color:#f2ebe1;">
                        <th style="padding:14px 15px;text-align:left;color:#5a4b3c;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Sản phẩm</th>
                        <th style="padding:14px 15px;text-align:center;color:#5a4b3c;font-size:13px;text-transform:uppercase;letter-spacing:1px;">SL</th>
                        <th style="padding:14px 15px;text-align:right;color:#5a4b3c;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Đơn giá</th>
                        <th style="padding:14px 15px;text-align:right;color:#5a4b3c;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>${orderItemsHtml}</tbody>
                  </table>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:15px;">
                    <tr>
                      <td width="50%"></td>
                      <td width="50%">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="right" style="padding:6px 12px;color:#8b7d6b;font-size:14px;">Tổng tiền hàng:</td>
                            <td align="right" width="130" style="padding:6px 12px;color:#5a4b3c;font-size:15px;font-weight:500;">${formatCurrency(order.TongTienHang)}</td>
                          </tr>
                          <tr>
                            <td align="right" style="padding:6px 12px;color:#8b7d6b;font-size:14px;">Phí vận chuyển:</td>
                            <td align="right" style="padding:6px 12px;color:#5a4b3c;font-size:15px;font-weight:500;">${formatCurrency(order.TongPhiVanChuyen)}</td>
                          </tr>
                          ${promotionHtml}
                          <tr>
                            <td align="right" style="padding:20px 12px 5px;color:#3e3222;font-size:16px;font-weight:bold;border-top:2px solid #eadecb;">TỔNG THANH TOÁN:</td>
                            <td align="right" style="padding:20px 0 5px 12px;color:#b05c3c;font-size:22px;font-weight:bold;border-top:2px solid #eadecb;">${formatCurrency(order.TongThanhToan)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:30px 40px;background-color:#3e3222;">
                  <p style="color:#eadecb;font-size:15px;margin:0 0 12px 0;">
                    Cần hỗ trợ? Hãy liên hệ với chúng tôi qua Hotline: <strong style="color:#ffffff;letter-spacing:1px;">0329 835 725</strong>
                  </p>
                  <p style="color:#8b7d6b;font-size:13px;line-height:1.6;margin:0;">
                    Email này được gửi tự động từ hệ thống, vui lòng không phản hồi.<br>
                    &copy; ${new Date().getFullYear()} <strong>The Ceramic Shop</strong>. All rights reserved.
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

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || "The Ceramic Shop",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject: mailSubject,
        htmlContent,
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
  }
};
