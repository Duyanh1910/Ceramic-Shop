import {
  createZaloPayPaymentUrl,
  verifyAndUpdateCallback,
} from "../../services/payment/zalopay.services.js";

import ErrorHandler from "../../utils/error_handler.js";

export const createZaloPayPayment = async (req, res, next) => {
  try {
    const { maDonHang } = req.body;

    if (!maDonHang) {
      return next(new ErrorHandler("Vui lòng cung cấp mã đơn hàng", 400));
    }

    const payUrl = await createZaloPayPaymentUrl(maDonHang);

    res.status(200).json({
      success: true,
      message: "Tạo link thanh toán ZaloPay thành công",
      payUrl: payUrl,
    });
  } catch (error) {
    next(error);
  }
};
export const zaloPayCallback = async (req, res) => {
  try {
    console.log(">>> ZaloPay đã gọi vào Callback! Body:", req.body);
    await verifyAndUpdateCallback(req.body);

    return res.json({
      return_code: 1,
      return_message: "success",
    });
  } catch (error) {
    console.error("ZaloPay IPN Error:", error.message);
    if (error.message === "Sai chữ ký Callback từ ZaloPay") {
      return res.json({
        return_code: -1,
        return_message: "mac not equal",
      });
    }

    return res.json({
      return_code: 0,
      return_message: error.message,
    });
  }
};
