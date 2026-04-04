import { PaymentMethodModel } from "../../models/index.js";

export const getAllPaymentMethodService = async () => {
  const method = await PaymentMethodModel.findAll({});
  return method;
};
