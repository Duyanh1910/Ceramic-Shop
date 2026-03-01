import ErrorHandler from "../utils/error_handler.js";
import {
  loginService,
  customerRegisterService,
} from "../services/auth.services.js";
import { checkValidate, isStringEmpty } from "../utils/helpers.js";

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!checkValidate(username, password)) {
      throw new ErrorHandler("Username và password không được để trống!", 400);
    }
    const result = await loginService(username, password);
    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const customerRegister = async (req, res, next) => {
  try {
    const { username, password, name, phone_number, email, address } = req.body;
    if (!checkValidate(username, password)) {
      throw new ErrorHandler("Username và password không được để trống!", 400);
    }
    if (password.length < 6) {
      throw new ErrorHandler(`Mật khẩu phải dài hơn 6 ký tự!`, 400);
    }
    if (!checkValidate(name, phone_number, email, address)) {
      throw new ErrorHandler(`Vui lòng điền đầy đủ thông tin khách hàng!`, 400);
    }
    const result = await customerRegisterService(
      username,
      password,
      name,
      phone_number,
      email,
      address,
    );
    res.status(201).json({
      success: true,
      message: "Tạo tài khoản mới thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};
