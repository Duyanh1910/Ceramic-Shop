import express from "express";
import { verifyVnpay } from "../../utils/payment/vnpay.util.js";
import { createVnpayUrl } from "../../services/payment/vnpay.services.js";
import {
  PaymentTransactionModel,
  OrderModel,
  sequelize,
} from "../../models/index.js";
import ErrorHandler from "../../utils/error_handler.js";

const router = express.Router();

/**
 * =========================
 * 🔁 RETURN URL
 * =========================
 */
router.get("/vnpay-return", (req, res) => {
  console.log("\n===== [VNPAY RETURN] =====");
  console.log("Full Query:", req.query);

  const verify = verifyVnpay(req.query, process.env.VNP_HASHSECRET);
  console.log("Verify Result:", verify);

  const { vnp_TxnRef, vnp_ResponseCode } = req.query;

  if (!verify.isSuccess) {
    console.error("❌ INVALID SIGNATURE");
    return res.redirect(
      `http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}&reason=invalid_signature`,
    );
  }

  console.log("✅ SIGNATURE VALID");

  if (vnp_ResponseCode === "24") {
    console.warn("⚠️ USER CANCEL PAYMENT");
    return res.redirect(
      `http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}&type=cancel`,
    );
  }

  if (vnp_ResponseCode !== "00") {
    console.error("❌ PAYMENT FAILED CODE:", vnp_ResponseCode);
    return res.redirect(`http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}`);
  }

  console.log("🎉 PAYMENT SUCCESS");

  return res.redirect(
    `http://localhost:5173/success.html?txnRef=${vnp_TxnRef}`,
  );
});

/**
 * =========================
 * 🔁 IPN (SERVER TO SERVER)
 * =========================
 */
router.get("/vnpay-ipn", async (req, res) => {
  console.log("\n===== [VNPAY IPN] =====");
  console.log("Raw Query:", req.query);

  const verify = verifyVnpay(req.query, process.env.VNP_HASHSECRET);
  console.log("Verify Result:", verify);

  if (!verify.isSuccess) {
    console.error("❌ INVALID SIGNATURE (IPN)");
    return res.json({ RspCode: "97", Message: "Invalid signature" });
  }

  console.log("✅ SIGNATURE VALID (IPN)");

  const data = verify.data;
  console.log("Clean Data (after verify):", data);

  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = data;

  try {
    await sequelize.transaction(async (t) => {
      console.log("🔍 Finding transaction with TxnRef:", vnp_TxnRef);

      const giaoDich = await PaymentTransactionModel.findOne({
        where: { MaThamChieu: vnp_TxnRef },
        lock: true,
        transaction: t,
      });

      if (!giaoDich) {
        console.error("❌ Transaction NOT FOUND");
        throw new ErrorHandler("Order not found", 404);
      }

      console.log("✅ Found Transaction:", giaoDich.toJSON());

      if (giaoDich.TrangThai !== "PENDING") {
        console.warn("⚠️ Transaction already processed:", giaoDich.TrangThai);
        throw new ErrorHandler("Already processed", 400);
      }

      console.log("💰 Compare amount:");
      console.log("VNPAY:", Number(vnp_Amount));
      console.log("DB:", giaoDich.SoTien * 100);

      if (Number(vnp_Amount) !== giaoDich.SoTien * 100) {
        console.error("❌ INVALID AMOUNT");
        throw new ErrorHandler("Invalid amount", 400);
      }

      const isSuccess = vnp_ResponseCode === "00";
      console.log("📌 Payment status:", isSuccess ? "SUCCESS" : "FAILED");

      await giaoDich.update(
        {
          TrangThai: isSuccess ? "SUCCESS" : "FAILED",
          MaGiaoDichDoiTac: vnp_TransactionNo,
          MaLoi: vnp_ResponseCode,
          DuLieuPhanHoi: data,
        },
        { transaction: t },
      );

      console.log("✅ Updated transaction");

      if (isSuccess) {
        console.log("🔄 Updating order payment status...");
        await OrderModel.update(
          { TrangThaiThanhToan: 1 },
          {
            where: { MaDonHang: giaoDich.MaDonHang },
            transaction: t,
          },
        );
        console.log("✅ Order updated");
      }
    });

    console.log("🎉 IPN SUCCESS");
    return res.json({ RspCode: "00", Message: "OK" });
  } catch (err) {
    console.error("🔥 IPN ERROR:", err.message);
    return res.json({ RspCode: "99", Message: err.message });
  }
});

/**
 * =========================
 * 💳 CREATE PAYMENT URL
 * =========================
 */
router.post("/vnpay-create", async (req, res, next) => {
  try {
    console.log("\n===== [CREATE VNPAY URL] =====");

    console.log("📦 Body:", req.body);
    console.log("👤 User:", req.user);

    let ipAddr =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    if (typeof ipAddr === "string" && ipAddr.includes(",")) {
      ipAddr = ipAddr.split(",")[0].trim();
    }

    console.log("🌐 IP Address:", ipAddr);

    const paymentUrl = await createVnpayUrl({
      maDonHang: req.body.maDonHang,
      ipAddr,
    });

    console.log("🔗 Payment URL generated:");
    console.log(paymentUrl);

    res.json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    console.error("🔥 CREATE ERROR:", err);
    next(err);
  }
});

export default router;
