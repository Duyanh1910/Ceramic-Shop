import { getAllPaymentMethodService } from "../../services/payment/payment_method.services.js";
export const getAllPaymentMethods = async (req, res, next) => {
  try {
    const method = await getAllPaymentMethodService();
    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách phương thức thanh toán thành công!",
      result: method,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
