import express from "express";
import { verifyVnpay } from "../../utils/payment/vnpay.util.js";
import { createVnpayUrl } from "../../services/payment/vnpay.services.js";

const router = express.Router();

// ================= RETURN =================
router.get("/vnpay-return", (req, res) => {
  console.log("\n===== [VNPAY RETURN] =====");

  const verify = verifyVnpay(req.query, process.env.VNP_HASHSECRET);

  const { vnp_TxnRef, vnp_ResponseCode } = req.query;

  if (!verify.isSuccess) {
    return res.redirect(
      `http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}&reason=invalid_signature`,
    );
  }

  if (vnp_ResponseCode !== "00") {
    return res.redirect(`http://localhost:5173/fail.html?txnRef=${vnp_TxnRef}`);
  }

  return res.redirect(
    `http://localhost:5173/success.html?txnRef=${vnp_TxnRef}`,
  );
});

// ================= CREATE =================
router.post("/vnpay-create", async (req, res, next) => {
  try {
    let ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (ipAddr.includes(",")) {
      ipAddr = ipAddr.split(",")[0].trim();
    }

    const paymentUrl = await createVnpayUrl({
      maDonHang: req.body.maDonHang,
      ipAddr,
    });

    res.json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
