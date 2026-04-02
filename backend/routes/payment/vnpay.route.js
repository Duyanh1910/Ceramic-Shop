import express from "express";
import { verifyVnpay } from "../../utils/payment/vnpay.util.js";
import { createVnpayUrl } from "../../services/payment/vnpay.services.js";
import {
  PaymentTransactionModel,
  OrderModel,
  sequelize,
} from "../../models/index.js";

const router = express.Router();

router.get("/vnpay-return", (req, res) => {
  console.log("-----> ĐÃ NHẬN REQUEST TỪ VNPAY VÀO RETURN URL!");
  console.log("Query URL là:", req.query);
  const verify = verifyVnpay(req.query, process.env.VNP_HASHSECRET);

  const { vnp_TxnRef, vnp_ResponseCode } = req.query;

  if (!verify.isSuccess) {
    return res.redirect(
      `http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}&reason=invalid_signature`,
    );
  }

  if (vnp_ResponseCode === "24") {
    return res.redirect(
      `http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}&type=cancel`,
    );
  }
  if (vnp_ResponseCode !== "00") {
    return res.redirect(`http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}`);
  }

  return res.redirect(
    `http://localhost:5173/success.html?txnRef=${vnp_TxnRef}`,
  );
});

router.get("/vnpay-ipn", async (req, res) => {
  const verify = verifyVnpay(req.query, process.env.VNP_HASHSECRET);

  if (!verify.isSuccess) {
    return res.json({ RspCode: "97", Message: "Invalid signature" });
  }

  const data = verify.data;
  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = data;

  try {
    await sequelize.transaction(async (t) => {
      const giaoDich = await PaymentTransactionModel.findOne({
        where: { MaThamChieu: vnp_TxnRef },
        lock: true,
        transaction: t,
      });

      if (!giaoDich) {
        throw new Error("Order not found");
      }

      if (giaoDich.TrangThai !== "PENDING") {
        throw new Error("Already processed");
      }

      if (Number(vnp_Amount) !== giaoDich.SoTien * 100) {
        throw new Error("Invalid amount");
      }

      const isSuccess = vnp_ResponseCode === "00";

      await giaoDich.update(
        {
          TrangThai: isSuccess ? "SUCCESS" : "FAILED",
          MaGiaoDichDoiTac: vnp_TransactionNo,
          MaLoi: vnp_ResponseCode,
          DuLieuPhanHoi: data,
        },
        { transaction: t },
      );

      if (isSuccess) {
        await OrderModel.update(
          { TrangThaiThanhToan: 1 },
          {
            where: { MaDonHang: giaoDich.MaDonHang },
            transaction: t,
          },
        );
      }
    });

    return res.json({ RspCode: "00", Message: "OK" });
  } catch (err) {
    return res.json({ RspCode: "99", Message: err.message });
  }
});

router.post("/vnpay-create", async (req, res, next) => {
  try {
    console.log("-----> ĐÃ NHẬN REQUEST TỪ VNPAY VÀO IPN URL!");
    // SỬA LỖI 4: Xử lý chuỗi IP có chứa dấu phẩy từ Proxy/Load Balancer
    let ipAddr =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    if (typeof ipAddr === "string" && ipAddr.includes(",")) {
      ipAddr = ipAddr.split(",")[0].trim();
    }

    const paymentUrl = await createVnpayUrl({
      maDonHang: req.body.maDonHang,
      ipAddr, // Truyền IP đã chuẩn hóa
    });

    res.json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;
