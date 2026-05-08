import ErrorHandler from "../utils/error_handler.js";
import {
  loginService,
  customerRegisterService,
  getMeService,
  changePasswordService,
  OAuthService,
} from "../services/auth.services.js";
import {
  checkValidate,
  isStringEmpty,
  isValidEmail,
  isValidPhoneNumber,
  isValidUsername,
} from "../utils/helpers.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const login = async (req, res, next) => {
  try {
    const { username, password, rememberMe } = req.body;
    if (!checkValidate(username, password)) {
      throw new ErrorHandler("Username và password không được để trống!", 400);
    }
    const result = await loginService(username, password, rememberMe);
    const maxAge = result.expiresInDays * 24 * 60 * 60 * 1000;
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: maxAge,
    });
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        username: result.username,
        role: result.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const customerRegister = async (req, res, next) => {
  try {
    const { username, password, name, phone_number, email, address } = req.body;
    if (!checkValidate(username, password)) {
      throw new ErrorHandler("Username và password không được để trống!", 422);
    }

    if (!checkValidate(email)) {
      throw new ErrorHandler("Email không được để trống!", 422);
    }
    if (!isValidUsername(username)) {
      throw new ErrorHandler("Định dạng username không hợp lệ!", 422);
    }
    if (!isValidEmail(email)) {
      throw new ErrorHandler("Định dạng email không hợp lệ!", 422);
    }
    if (!isStringEmpty(name) && name.length > 100) {
      throw new ErrorHandler("Tên khách hàng không hợp lệ!", 422);
    }
    if (!isStringEmpty(phone_number) && !isValidPhoneNumber(phone_number)) {
      throw new ErrorHandler("Số điện thoại không hợp lệ!", 422);
    }
    if (!isStringEmpty(address) && address.length > 255) {
      throw new ErrorHandler("Địa chỉ không hợp lệ!", 422);
    }
    if (password.length < 6) {
      throw new ErrorHandler(`Mật khẩu phải dài hơn 6 ký tự!`, 422);
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

export const getMe = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const user = await getMeService(id);
    if (!user) {
      return next(new ErrorHandler("Không tìm thấy người dùng này!", 404));
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công!",
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const id = Number(req.user.id);

    if (!newPassword) {
      return next(new ErrorHandler("Vui lòng nhập mật khẩu mới!", 400));
    }
    if (oldPassword && oldPassword === newPassword) {
      return next(new ErrorHandler("Mật khẩu cũ và mới phải khác nhau!", 400));
    }
    if (newPassword.length < 6) {
      return next(new ErrorHandler("Mật khẩu phải có ít nhất 6 ký tự!", 400));
    }

    await changePasswordService(id, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: "Cập nhật mật khẩu thành công!",
    });
  } catch (err) {
    next(err);
  }
};

export const googleCallbackController = async (req, res, next) => {
  try {
    const rememberMe = req.query.state;
    const result = await OAuthService(req.user, "google", rememberMe);
    const maxAge = result.expiresInDays * 24 * 60 * 60 * 1000;
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: maxAge,
    });
    res.redirect("https://ceramic-shop-rho.vercel.app/login-success");
  } catch (error) {
    console.error(error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
};

export const facebookCallbackController = async (req, res, next) => {
  try {
    const rememberMe = req.query.state;
    const result = await OAuthService(req.user, "facebook", rememberMe);
    const maxAge = result.expiresInDays * 24 * 60 * 60 * 1000;
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: maxAge,
    });
    res.redirect("https://ceramic-shop-rho.vercel.app/login-success");
  } catch (error) {
    console.error(error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
};
