import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  AccountModel,
  CustomerModel,
  RoleModel,
  sequelize,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;
import { SALT_ROUNDS } from "../config/app_config.js";

export const customerRegisterService = async (
  username,
  password,
  name,
  phone_number,
  email,
  address,
) => {
  const account = await AccountModel.findOne({
    where: {
      Username: username,
    },
  });
  if (account == null) {
    const transaction = await sequelize.transaction();
    try {
      const hashed = await bcrypt.hash(password, Number(SALT_ROUNDS));
      const newAccount = await AccountModel.create(
        {
          Username: username,
          Password: hashed,
          ID_PhanQuyen: 3,
        },
        { transaction },
      );
      await CustomerModel.create(
        {
          ID_TaiKhoan: newAccount.ID_TaiKhoan,
          TenKhachHang: name,
          SDT: phone_number,
          Email: email,
          DiaChi: address,
        },
        {
          transaction,
        },
      );
      await transaction.commit();
      return {
        username,
        role: "customer",
      };
    } catch (err) {
      await transaction.rollback();
      throw new ErrorHandler(`Lỗi server!`, 500);
    }
  } else {
    throw new ErrorHandler("Tài khoản này đã tồn tại!", 400);
  }
};

export const loginService = async (username, password) => {
  const account = await AccountModel.findOne({
    where: {
      Username: username,
    },
    include: [
      {
        model: RoleModel,
        attributes: ["TenPhanQuyen"],
      },
    ],
  });
  if (account == null) {
    throw new ErrorHandler("Tên đăng nhập hoặc mật khẩu không chính xác!", 401);
  }
  const isMatch = account
    ? await bcrypt.compare(password, account.Password)
    : false;
  if (!isMatch) {
    throw new ErrorHandler("Tên đăng nhập hoặc mật khẩu không chính xác!", 401);
  }
  const role = account.PhanQuyen.TenPhanQuyen;
  const token = jwt.sign(
    {
      id: account.ID_TaiKhoan,
      role: role,
    },
    JWT_SECRET,
    {
      expiresIn: String(EXPIRES_IN),
    },
  );
  return {
    username,
    token,
    role: role,
  };
};
