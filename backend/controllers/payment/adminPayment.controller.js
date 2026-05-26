import ErrorHandler from "../../utils/error_handler.js";
import {
  confirmRefundTransactionAdminService,
  failRefundTransactionAdminService,
  getAllPaymentTransactionsAdminService,
  getPaymentTransactionByIdAdminService,
} from "../../services/payment/admin_payment_transaction.services.js";

const parseId = (value, message = "ID không hợp lệ!") => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return numberValue;
};

export const getAllPaymentTransactions = async (req, res, next) => {
  try {
    const result = await getAllPaymentTransactionsAdminService(req.query);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách giao dịch thanh toán thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentTransactionById = async (req, res, next) => {
  try {
    const MaGiaoDich = parseId(req.params.id);
    const result = await getPaymentTransactionByIdAdminService(MaGiaoDich);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết giao dịch thanh toán thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const confirmRefundTransaction = async (req, res, next) => {
  try {
    const MaGiaoDich = parseId(req.params.id);
    const result = await confirmRefundTransactionAdminService(
      MaGiaoDich,
      req.body || {},
    );

    res.status(200).json({
      success: true,
      message: "Xác nhận hoàn tiền thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const failRefundTransaction = async (req, res, next) => {
  try {
    const MaGiaoDich = parseId(req.params.id);

    if (!req.body?.GhiChu && !req.body?.MaLoi) {
      throw new ErrorHandler("Vui lòng nhập lý do hoàn tiền thất bại!", 422);
    }

    const result = await failRefundTransactionAdminService(
      MaGiaoDich,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu hoàn tiền thất bại!",
      result,
    });
  } catch (err) {
    next(err);
  }
};