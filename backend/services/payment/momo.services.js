import crypto from "crypto";
import axios from "axios";
import ErrorHandler from "../../utils/error_handler.js";
import {
  OrderModel,
  PaymentTransactionModel,
  CustomerModel,
  sequelize,
  AccountModel,
} from "../../models/index.js";
import { sendEmailInvoiceService } from "../email.services.js";

const MOMO_CONFIG = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  apiUrl: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: "https://ceramic-shop-rho.vercel.app/payment-result",
  ipnUrl: "https://ceramic-shop-u8ak.onrender.com/api/v1/payment/momo-ipn",
};

export const createMomoPaymentUrl = async (maDonHang) => {
  return await sequelize.transaction(async (t) => {
    const donHang = await OrderModel.findOne({
      where: { MaDonHang: maDonHang, TrangThaiThanhToan: 0, MaPhuongThuc: 4 },
      lock: true,
      transaction: t,
    });

    if (!donHang) {
      throw new ErrorHandler("Đơn hàng không tồn tại hoặc đã thanh toán", 404);
    }

    if (Number(donHang.TrangThaiDonHang) === 4) {
      throw new ErrorHandler("Đơn hàng đã bị hủy, không thể thanh toán lại", 400);
    }

    const amount = Math.round(Number(donHang.TongThanhToan));
    const orderId = `MOMO_${maDonHang}_${Date.now()}`;
    const requestId = orderId;
    const orderInfo = `Thanh toán đơn hàng ${maDonHang}`;
    const requestType = "captureWallet";
    const extraData = "";

    await PaymentTransactionModel.create(
      {
        MaDonHang: maDonHang,
        MaPhuongThuc: 4,
        MaThamChieu: orderId,
        SoTien: amount,
        TrangThai: "PENDING",
      },
      { transaction: t },
    );

    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: "vi",
    };

    try {
      const response = await axios.post(MOMO_CONFIG.apiUrl, requestBody);

      if (response.data.resultCode === 0) {
        return response.data.payUrl;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(
        "MoMo Create Error:",
        error.response?.data || error.message,
      );
      throw new ErrorHandler("Lỗi kết nối cổng thanh toán MoMo", 500);
    }
  });
};

export const verifyAndUpdateIpn = async (momoData) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = momoData;

  const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const serverSignature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  if (signature !== serverSignature) {
    throw new Error("Sai chữ ký IPN từ MoMo");
  }

  await sequelize.transaction(async (t) => {
    const giaoDich = await PaymentTransactionModel.findOne({
      where: { MaThamChieu: orderId },
      lock: true,
      transaction: t,
    });

    if (!giaoDich || giaoDich.TrangThai !== "PENDING") {
      return;
    }

    if (Math.round(Number(giaoDich.SoTien)) !== Math.round(Number(amount))) {
      await giaoDich.update(
        {
          TrangThai: "FAILED",
          MaGiaoDichDoiTac: transId?.toString(),
          MaLoi: "AMOUNT_MISMATCH",
          DuLieuPhanHoi: momoData,
        },
        { transaction: t },
      );
      return;
    }

    const currentOrder = await OrderModel.findByPk(giaoDich.MaDonHang, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (
      !currentOrder ||
      Number(currentOrder.TrangThaiDonHang) === 4 ||
      Number(currentOrder.MaPhuongThuc) !== 4
    ) {
      await giaoDich.update(
        {
          TrangThai: "FAILED",
          MaGiaoDichDoiTac: transId?.toString(),
          MaLoi: "ORDER_CANCELED_OR_INVALID",
          DuLieuPhanHoi: momoData,
        },
        { transaction: t },
      );
      return;
    }

    const isSuccess = resultCode === 0;

    await giaoDich.update(
      {
        TrangThai: isSuccess ? "SUCCESS" : "FAILED",
        MaGiaoDichDoiTac: transId?.toString(),
        MaLoi: resultCode?.toString(),
        DuLieuPhanHoi: momoData,
      },
      { transaction: t },
    );

    if (isSuccess) {
      await OrderModel.update(
        { TrangThaiThanhToan: 1 },
        { where: { MaDonHang: giaoDich.MaDonHang }, transaction: t },
      );
      try {
        const order = await OrderModel.findOne({
          where: { MaDonHang: giaoDich.MaDonHang },
          include: [
            {
              model: CustomerModel,
              include: [
                {
                  model: AccountModel,
                  attributes: ["Email"],
                },
              ],
            },
          ],
          transaction: t,
        });
        sendEmailInvoiceService(
          order.KhachHang.TaiKhoan.Email,
          order.MaHienThi,
        );
      } catch (err) {
        throw new Error("Lỗi server!");
      }
    }
  });
};
