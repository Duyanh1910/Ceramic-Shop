import { CustomerModel, AccountModel } from "../models/index.js";

export const getAllCustomersService = async () => {
  const users = await CustomerModel.findAll({
    attributes: {
      exclude: ["MaTaiKhoan"],
    },
  });
  return users;
};

export const getCustomerService = async (id) => {
  const user = await CustomerModel.findOne({
    where: {
      MaKhachHang: id,
    },
    include: {
      model: AccountModel,
      attributes: ["Username", "Email"],
    },
  });
  return user;
};
