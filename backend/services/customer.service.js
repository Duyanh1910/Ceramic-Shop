import { CustomerModel } from "../models/index.js";

export const getAllCustomersService = async () => {
  const users = await CustomerModel.findAll({
    attributes: {
      exclude: ["MaTaiKhoan"],
    },
  });
  return users;
};
