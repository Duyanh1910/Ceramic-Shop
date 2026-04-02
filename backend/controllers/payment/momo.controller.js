import {
  createMomoPaymentUrl,
  verifyAndUpdateIpn,
} from "../../services/payment/momo.services.js";

export const createPayment = async (req, res, next) => {
  try {
    const { maDonHang } = req.body;

    if (!maDonHang) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã đơn hàng" });
    }

    const paymentUrl = await createMomoPaymentUrl(maDonHang);

    res.status(200).json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    next(err);
  }
};

export const handleMoMoIpn = async (req, res) => {
  try {
    console.log("\n===== [MOMO IPN RECEIVED] =====");
    console.log(req.body);

    await verifyAndUpdateIpn(req.body);

    console.log("✅ Cập nhật giao dịch MoMo thành công!");

   
    return res.status(204).send();
  } catch (err) {
    console.error("🔥 LỖI MOMO IPN:", err.message);
    return res.status(204).send();
  }
};
