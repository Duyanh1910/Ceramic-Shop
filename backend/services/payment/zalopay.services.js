import crypto from "crypto";
import axios from "axios";
import qs from "qs"; 
import ErrorHandler from "../../utils/error_handler.js";
import {
  OrderModel,
  PaymentTransactionModel,
  sequelize,
} from "../../models/index.js";

const ZALOPAY_CONFIG = {
  app_id: "553",
  key1: "9phuAOYhan4urywHTh0ndEXiV3pKHr5Q",
  key2: "Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3",
  apiUrl: "https://sb-openapi.zalopay.vn/v2/create",
  redirectUrl: "https://ceramic-shop-rho.vercel.app/payment-result",
};

const getYYMMDD = () => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
};

export const createZaloPayPaymentUrl = async (maDonHang) => {
  console.log("===== [ZALOPAY CREATE] START =====");
  console.log("Mã đơn hàng:", maDonHang);

  return await sequelize.transaction(async (t) => {
    const donHang = await OrderModel.findOne({
      where: { MaDonHang: maDonHang, TrangThaiThanhToan: 0 },
      lock: true,
      transaction: t,
    });

    console.log("Đơn hàng tìm được:", donHang?.toJSON());

    if (!donHang) {
      throw new ErrorHandler("Đơn hàng không tồn tại hoặc đã thanh toán", 404);
    }

    const amount = Math.round(Number(donHang.TongThanhToan));
    console.log("Số tiền thanh toán:", amount);

    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${getYYMMDD()}_${maDonHang}_${transID}`;
    const app_user = "CeramicShopUser";
    const app_time = Date.now();

    console.log("app_trans_id:", app_trans_id);

    const embed_data = JSON.stringify({
      redirecturl: ZALOPAY_CONFIG.redirectUrl,
    });

    const item = JSON.stringify([{}]);

    await PaymentTransactionModel.create(
      {
        MaDonHang: maDonHang,
        MaPhuongThuc: 5,
        MaThamChieu: app_trans_id,
        SoTien: amount,
        TrangThai: "PENDING",
      },
      { transaction: t },
    );

    console.log("Đã tạo transaction PENDING trong DB");

    const rawSignature = [
      ZALOPAY_CONFIG.app_id,
      app_trans_id,
      app_user,
      amount,
      app_time,
      embed_data,
      item,
    ].join("|");

    const mac = crypto
      .createHmac("sha256", ZALOPAY_CONFIG.key1)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      app_id: ZALOPAY_CONFIG.app_id,
      app_trans_id,
      app_user,
      app_time,
      item,
      embed_data,
      amount,
      description: `Thanh toan don hang ${maDonHang}`,
      bank_code: "",
      mac,
      callback_url:
        "https://ceramic-shop-u8ak.onrender.com/api/v1/payment/zalo-ipn", 
    };

    console.log("Request gửi ZaloPay:", requestBody);

    try {
      const response = await axios.post(
        ZALOPAY_CONFIG.apiUrl,
        qs.stringify(requestBody), 
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      console.log("Response từ ZaloPay:", response.data);

      if (response.data.return_code === 1) {
        console.log("===== [ZALOPAY CREATE SUCCESS] =====");
        return response.data.order_url;
      } else {
        console.log("===== [ZALOPAY CREATE FAIL] =====");
        throw new Error(response.data.return_message);
      }
    } catch (error) {
      console.error(
        "ZaloPay Create Error:",
        error.response?.data || error.message,
      );
      throw new ErrorHandler("Lỗi kết nối cổng thanh toán ZaloPay", 500);
    }
  });
};
export const verifyAndUpdateCallback = async (zaloPayBody) => {
  console.log("===== [ZALOPAY CALLBACK] START =====");
  console.log("Body nhận được:", zaloPayBody);

  const { data: dataStr, mac: reqMac } = zaloPayBody;

  if (!dataStr) {
    throw new Error("Callback không có data");
  }

  const mac = crypto
    .createHmac("sha256", ZALOPAY_CONFIG.key2)
    .update(dataStr)
    .digest("hex");

  console.log("mac server tính:", mac);

  if (reqMac !== mac) {
    console.log("❌ Sai chữ ký! Dữ liệu có thể bị giả mạo.");
    throw new Error("Sai chữ ký Callback từ ZaloPay");
  }

  console.log("✅ Chữ ký hợp lệ. Bắt đầu cập nhật DB...");

  const dataJson = JSON.parse(dataStr);
  console.log("Parsed data:", dataJson);

  const app_trans_id = dataJson["app_trans_id"];
  const zp_trans_id = dataJson["zp_trans_id"];

  await sequelize.transaction(async (t) => {
    const giaoDich = await PaymentTransactionModel.findOne({
      where: { MaThamChieu: app_trans_id },
      lock: true,
      transaction: t,
    });

    if (!giaoDich || giaoDich.TrangThai !== "PENDING") {
      console.log("⚠️ Giao dịch không tồn tại hoặc đã được xử lý từ trước.");
      return;
    }
    await giaoDich.update(
      {
        TrangThai: "SUCCESS",
        MaGiaoDichDoiTac: zp_trans_id?.toString(),
        MaLoi: "1",
        DuLieuPhanHoi: dataJson,
      },
      { transaction: t },
    );

    console.log("✅ Đã update transaction thành SUCCESS");

    await OrderModel.update(
      { TrangThaiThanhToan: 1 },
      { where: { MaDonHang: giaoDich.MaDonHang }, transaction: t },
    );

    console.log("✅ Đã update trạng thái đơn hàng thành Đã Thanh Toán");
  });

  console.log("===== [ZALOPAY CALLBACK DONE] =====");
};
