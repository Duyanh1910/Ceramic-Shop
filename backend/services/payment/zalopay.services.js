import crypto from "crypto";
import axios from "axios";
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
  return await sequelize.transaction(async (t) => {
    const donHang = await OrderModel.findOne({
      where: { MaDonHang: maDonHang, TrangThaiThanhToan: 0 },
      lock: true,
      transaction: t,
    });

    if (!donHang) {
      throw new ErrorHandler("Đơn hàng không tồn tại hoặc đã thanh toán", 404);
    }

    const amount = Math.round(Number(donHang.TongThanhToan));

    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${getYYMMDD()}_${maDonHang}_${transID}`;
    const app_user = "CeramicShopUser";
    const app_time = Date.now();

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
      app_trans_id: app_trans_id,
      app_user: app_user,
      app_time: app_time,
      item: item,
      embed_data: embed_data,
      amount: amount,
      description: `Thanh toan don hang ${maDonHang}`,
      bank_code: "",
      mac: mac,
      callback_url:
        "https://ceramic-shop-u8ak.onrender.com/api/v1/payment/zalo-ipn",
    };

    try {
      const response = await axios.post(ZALOPAY_CONFIG.apiUrl, null, {
        params: requestBody,
      });

      if (response.data.return_code === 1) {
        return response.data.order_url;
      } else {
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
  const { data: dataStr, mac: reqMac } = zaloPayBody;

  const mac = crypto
    .createHmac("sha256", ZALOPAY_CONFIG.key2)
    .update(dataStr)
    .digest("hex");

  if (reqMac !== mac) {
    throw new Error("Sai chữ ký Callback từ ZaloPay");
  }

  const dataJson = JSON.parse(dataStr);
  const app_trans_id = dataJson["app_trans_id"];
  const zp_trans_id = dataJson["zp_trans_id"];

  await sequelize.transaction(async (t) => {
    const giaoDich = await PaymentTransactionModel.findOne({
      where: { MaThamChieu: app_trans_id },
      lock: true,
      transaction: t,
    });

    if (!giaoDich || giaoDich.TrangThai !== "PENDING") {
      return;
    }

    await giaoDich.update(
      {
        TrangThai: "SUCCESS",
        MaGiaoDichDoiTac: zp_trans_id.toString(),
        MaLoi: "1",
        DuLieuPhanHoi: dataJson,
      },
      { transaction: t },
    );
    console.log("Cập nhật thành công giao dịch");
    await OrderModel.update(
      { TrangThaiThanhToan: 1 },
      { where: { MaDonHang: giaoDich.MaDonHang }, transaction: t },
    );
    console.log("Thanh toán thành công zalopay");
  });
};
