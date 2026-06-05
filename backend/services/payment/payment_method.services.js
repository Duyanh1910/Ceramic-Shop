import { PaymentMethodModel } from "../../models/index.js";
import ErrorHandler from "../../utils/error_handler.js";

const normalizeText = (value, fieldName, maxLength) => {
  const text = String(value || "").trim();

  if (!text) {
    throw new ErrorHandler(`${fieldName} không được để trống!`, 422);
  }

  if (maxLength && text.length > maxLength) {
    throw new ErrorHandler(`${fieldName} không được vượt quá ${maxLength} ký tự!`, 422);
  }

  return text;
};

const normalizeOptionalText = (value, maxLength) => {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();

  if (!text) return null;

  if (maxLength && text.length > maxLength) {
    throw new ErrorHandler(`Mô tả không được vượt quá ${maxLength} ký tự!`, 422);
  }

  return text;
};

const normalizeStatus = (value, defaultValue = 1) => {
  if (value === undefined || value === null || value === "") return defaultValue;

  const numberValue = Number(value);

  if (![0, 1].includes(numberValue)) {
    throw new ErrorHandler("Trạng thái phương thức thanh toán không hợp lệ!", 422);
  }

  return numberValue;
};

const findPaymentMethodOrFail = async (MaPhuongThuc) => {
  const method = await PaymentMethodModel.findByPk(MaPhuongThuc);

  if (!method) {
    throw new ErrorHandler("Không tìm thấy phương thức thanh toán!", 404);
  }

  return method;
};

export const getAllPaymentMethodService = async () => {
  const method = await PaymentMethodModel.findAll({
    where: {
      TrangThai: 1,
    },
    order: [["MaPhuongThuc", "ASC"]],
  });
  return method;
};

export const getAllPaymentMethodsAdminService = async () => {
  return await PaymentMethodModel.findAll({
    order: [["MaPhuongThuc", "ASC"]],
  });
};

export const createPaymentMethodAdminService = async (payload) => {
  const TenPhuongThuc = normalizeText(payload?.TenPhuongThuc, "Tên phương thức", 100);
  const MoTa = normalizeOptionalText(payload?.MoTa, 255);
  const TrangThai = normalizeStatus(payload?.TrangThai, 1);

  return await PaymentMethodModel.create({
    TenPhuongThuc,
    MoTa,
    TrangThai,
  });
};

export const updatePaymentMethodAdminService = async (MaPhuongThuc, payload) => {
  const method = await findPaymentMethodOrFail(MaPhuongThuc);
  const updateData = {};

  if (payload?.TenPhuongThuc !== undefined) {
    updateData.TenPhuongThuc = normalizeText(
      payload.TenPhuongThuc,
      "Tên phương thức",
      100,
    );
  }

  if (payload?.MoTa !== undefined) {
    updateData.MoTa = normalizeOptionalText(payload.MoTa, 255);
  }

  if (payload?.TrangThai !== undefined) {
    updateData.TrangThai = normalizeStatus(payload.TrangThai);
  }

  await method.update(updateData);

  return method;
};
