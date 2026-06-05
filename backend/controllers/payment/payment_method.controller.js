import ErrorHandler from "../../utils/error_handler.js";
import {
  createPaymentMethodAdminService,
  getAllPaymentMethodService,
  getAllPaymentMethodsAdminService,
  updatePaymentMethodAdminService,
} from "../../services/payment/payment_method.services.js";

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHandler("ID phuong thuc thanh toan khong hop le!", 422);
  }

  return id;
};

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

export const getAllPaymentMethodsAdmin = async (req, res, next) => {
  try {
    const methods = await getAllPaymentMethodsAdminService();

    res.status(200).json({
      success: true,
      message: "Lay danh sach phuong thuc thanh toan thanh cong!",
      result: methods,
    });
  } catch (err) {
    next(err);
  }
};

export const createPaymentMethodAdmin = async (req, res, next) => {
  try {
    const method = await createPaymentMethodAdminService(req.body || {});

    res.status(201).json({
      success: true,
      message: "Tao phuong thuc thanh toan thanh cong!",
      result: method,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentMethodAdmin = async (req, res, next) => {
  try {
    const MaPhuongThuc = parseId(req.params.id);
    const method = await updatePaymentMethodAdminService(
      MaPhuongThuc,
      req.body || {},
    );

    res.status(200).json({
      success: true,
      message: "Cap nhat phuong thuc thanh toan thanh cong!",
      result: method,
    });
  } catch (err) {
    next(err);
  }
};
