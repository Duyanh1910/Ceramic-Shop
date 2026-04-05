import {
  createZaloPayPaymentUrl,
  verifyAndUpdateCallback,
  queryZaloPayTransaction,
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

export const checkZaloPayStatusController = async (req, res, next) => {
  try {
    const { app_trans_id } = req.params;

    if (!app_trans_id) {
      return next(new ErrorHandler("Thiếu mã giao dịch (app_trans_id)", 400));
    }

    const result = await queryZaloPayTransaction(app_trans_id);

    if (result.return_code === 1) {
      return res.status(200).json({
        success: true,
        message: "Thanh toán thành công",
        data: result,
      });
    } else if (result.return_code === 2) {
      return res.status(400).json({
        success: false,
        message: "Thanh toán thất bại",
        data: result,
      });
    } else if (result.return_code === 3) {
      return res.status(202).json({
        success: false,
        isPending: true,
        message: "Đơn hàng đang chờ thanh toán hoặc đang xử lý",
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Trạng thái giao dịch không xác định",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
};
