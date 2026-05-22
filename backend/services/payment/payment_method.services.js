import { PaymentMethodModel } from "../../models/index.js";

export const getAllPaymentMethodService = async () => {
  const method = await PaymentMethodModel.findAll({
    where: {
      MaPhuongThuc: [1, 4, 5],
      TrangThai: 1,
    },
    order: [["MaPhuongThuc", "ASC"]],
  });
  return method;
};
