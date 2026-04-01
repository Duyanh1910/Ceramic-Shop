import moment from "moment";
import vnpay from "../../config/vnpay.config.js";
import {
  OrderModel,
  PaymentTransactionModel,
  sequelize,
} from "../../models/index.js";

const createVnpayUrl = async ({ maDonHang, ipAddr }) => {
  return await sequelize.transaction(async (t) => {
    const donHang = await OrderModel.findOne({
      where: {
        MaDonHang: maDonHang,
        TrangThaiThanhToan: 0,
      },
      lock: true,
      transaction: t,
    });

    if (!donHang) {
      throw new Error("Đơn hàng không tồn tại hoặc đã thanh toán");
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

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: soTien * 100,
      vnp_TxnRef: maThamChieu,
      vnp_OrderInfo: `Thanh toan don hang ${maDonHang}`,
      vnp_OrderType: "other",
      vnp_IpAddr: ipAddr,
      vnp_Locale: "vn",
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    });

    return paymentUrl;
  });
};

const verifyReturn = (query) => {
  return vnpay.verifyReturnUrl(query);
};
const processIpn = async (query) => {
  const verify = vnpay.verifyIpnCall(query);

  if (!verify.isSuccess) {
    return { RspCode: "97", Message: "Invalid signature" };
  }

  const data = verify.data;
  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = data;

  return await sequelize.transaction(async (t) => {
    const giaoDich = await PaymentTransactionModel.findOne({
      where: { MaThamChieu: vnp_TxnRef },
      lock: true,
      transaction: t,
    });

    if (!giaoDich) {
      return { RspCode: "01", Message: "Order not found" };
    }

    if (giaoDich.TrangThai !== "PENDING") {
      return { RspCode: "02", Message: "Already processed" };
    }

    if (Number(vnp_Amount) !== giaoDich.SoTien * 100) {
      return { RspCode: "04", Message: "Invalid amount" };
    }

    const isSuccess = vnp_ResponseCode === "00";

    await giaoDich.update(
      {
        TrangThai: isSuccess
          ? "SUCCESS"
          : vnp_ResponseCode === "24"
            ? "CANCELED"
            : "FAILED",
        MaGiaoDichDoiTac: vnp_TransactionNo,
        MaLoi: vnp_ResponseCode,
        DuLieuPhanHoi: data,
      },
      { transaction: t },
    );

    if (isSuccess) {
      await OrderModel.update(
        { TrangThaiThanhToan: 1 },
        { where: { MaDonHang: giaoDich.MaDonHang }, transaction: t },
      );
    }

    return { RspCode: "00", Message: "OK" };
  });
};


const checkPaymentStatus = async (txnRef) => {
  const giaoDich = await PaymentTransactionModel.findOne({
    where: { MaThamChieu: txnRef },
  });

  if (!giaoDich) {
    throw new Error("Không tìm thấy giao dịch");
  }

  return {
    status: giaoDich.TrangThai,
    amount: giaoDich.SoTien,
  };
};

export { createVnpayUrl, verifyReturn, processIpn, checkPaymentStatus };
