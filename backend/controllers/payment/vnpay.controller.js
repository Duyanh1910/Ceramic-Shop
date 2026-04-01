import * as vnpayService from "../../services/payment/vnpay.services.js";

const createPayment = async (req, res) => {
  try {
    const { maDonHang } = req.body;

    const paymentUrl = await vnpayService.createVnpayUrl({
      maDonHang,
      ipAddr: req.ip,
    });

    return res.json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const vnpayReturn = (req, res) => {
  const verify = vnpayService.verifyReturn(req.query);

  if (!verify.isSuccess) {
    return res.redirect("/payment-failed?reason=invalid_signature");
  }

  const data = verify.data;
  const { vnp_ResponseCode, vnp_TxnRef } = data;

  if (vnp_ResponseCode === "00") {
    return res.redirect(`/payment-success?txnRef=${vnp_TxnRef}`);
  }

  if (vnp_ResponseCode === "24") {
    return res.redirect(`/payment-failed?type=cancel&txnRef=${vnp_TxnRef}`);
  }

  return res.redirect(`/payment-failed?type=fail&txnRef=${vnp_TxnRef}`);
};

const vnpayIpn = async (req, res) => {
  try {
    const result = await vnpayService.processIpn(req.query);
    return res.json(result);
  } catch (err) {
    return res.json({ RspCode: "99", Message: "Unknown error" });
  }
};

const checkPayment = async (req, res) => {
  try {
    const { txnRef } = req.query;

    const data = await vnpayService.checkPaymentStatus(txnRef);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export { createPayment, vnpayReturn, vnpayIpn, checkPayment };
