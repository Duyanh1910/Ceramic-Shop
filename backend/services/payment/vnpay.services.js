import moment from "moment";
import { buildPaymentUrl } from "../../utils/payment/vnpay.util.js";
import ErrorHandler from "../../utils/error_handler.js";
import {
  OrderModel,
  PaymentTransactionModel,
  sequelize,
} from "../../models/index.js";

const CONFIG = {
  tmnCode: process.env.VNP_TMNCODE,
  hashSecret: process.env.VNP_HASHSECRET,
  vnpUrl: process.env.VNP_URL,
};

export const createVnpayUrl = async ({ maDonHang, ipAddr }) => {
  return await sequelize.transaction(async (t) => {
    const donHang = await OrderModel.findOne({
      where: { MaDonHang: maDonHang, TrangThaiThanhToan: 0 },
      lock: true,
      transaction: t,
    });

    if (!donHang) {
      throw new ErrorHandler("Đơn hàng không tồn tại hoặc đã thanh toán", 404);
    }

    const soTien = donHang.TongThanhToan;
    const maThamChieu = `DH${maDonHang}_${Date.now()}`;

    await PaymentTransactionModel.create(
      {
        MaDonHang: maDonHang,
        MaPhuongThuc: 2,
        MaThamChieu: maThamChieu,
        SoTien: soTien,
        TrangThai: "PENDING",
      },
      { transaction: t },
    );

    return buildPaymentUrl(
      {
        vnp_Amount: soTien * 100,
        vnp_CurrCode: "VND",
        vnp_TxnRef: maThamChieu,
        vnp_OrderInfo: `Thanh toan don hang ${maDonHang}`,
        vnp_OrderType: "other",
        vnp_IpAddr: ipAddr,
        vnp_Locale: "vn",
        vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
        vnp_ExpireDate: moment().add(15, "minutes").format("YYYYMMDDHHmmss"),
        vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      },
      CONFIG,
    );
  });
};
