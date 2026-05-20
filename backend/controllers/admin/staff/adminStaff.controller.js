import {
  getAllStaffService,
  getStaffService,
  createStaffService,
  updateStaffMeService,
  updateStaffService,
  deleteStaffService,
} from "../../../services/staff.services.js";
import { getMeService } from "../../../services/auth.services.js";
import ErrorHandler from "../../../utils/error_handler.js";
import {
  checkValidate,
  isStringEmpty,
  isValidEmail,
  isValidPhoneNumber,
  isValidUsername,
  isValidDate,
} from "../../../utils/helpers.js";

export const getStaffs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "MaNhanVien",
      order = "DESC",
    } = req.query;
    const users = await getAllStaffService(
      Number(page),
      Number(limit),
      search,
      sort,
      order,
    );
    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách nhân viên thành công!",
      result: users,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getStaffInfo = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    const user = await getStaffService(id);
    if (!user) {
      return next(new ErrorHandler("ID không tồn tại!", 404));
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin khách hàng thành công!",
      result: user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getMyInfo = async (req, res, next) => {
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

export const updateStaffInfo = async (req, res, next) => {
  try {
    const { TenNhanVien, SDT, DiaChi, NgaySinh } = req.body;
    const id = Number(req.params.id);
    if (!isStringEmpty(SDT) && !isValidPhoneNumber(SDT)) {
      return next(new ErrorHandler("Số điện thoại không hợp lệ!", 422));
    }
    if (!isStringEmpty(DiaChi) && DiaChi.length > 255) {
      return next(new ErrorHandler("Địa chỉ không hợp lệ!", 422));
    }
    if (
      !isStringEmpty(NgaySinh) &&
      (!isValidDate(NgaySinh) ||
        new Date(NgaySinh) >= new Date() ||
        Date.now().getFullYear - new Date(NgaySinh).getFullYear < 18)
    ) {
      return next(new ErrorHandler("Ngày sinh không hợp lệ!", 422));
    }
    const data = { TenNhanVien, SDT, NgaySinh, DiaChi };
    const result = await updateStaffService(id, data);
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const createNewStaff = async (req, res, next) => {
  try {
    const { email, name, username, phoneNumber, dob, address } = req.body;
    if (!isStringEmpty(phoneNumber) && !isValidPhoneNumber(phoneNumber)) {
      return next(new ErrorHandler("Số điện thoại không hợp lệ!", 422));
    }
    if (!isStringEmpty(address) && address.length > 255) {
      return next(new ErrorHandler("Địa chỉ không hợp lệ!", 422));
    }
    if (
      !isStringEmpty(dob) &&
      (!isValidDate(dob) || new Date(dob) >= new Date())
    ) {
      return next(new ErrorHandler("Ngày sinh không hợp lệ!", 422));
    }
    if (!checkValidate(email) || !isValidEmail(email)) {
      return next(new ErrorHandler("Email không hợp lệ!", 422));
    }
    if (!isStringEmpty(name) && name.length > 100) {
      return next(new ErrorHandler("Tên không hợp lệ!", 422));
    }
    if (!isValidUsername(username)) {
      return next(new ErrorHandler("Định dạng username không hợp lệ!", 422));
    }
    const result = await createStaffService(
      email,
      name,
      username,
      phoneNumber,
      dob,
      address,
    );
    res.status(201).json({
      success: true,
      message: "Tạo nhân viên mới thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await deleteStaffService(id);
    res.status(200).json({
      success: true,
      message: "Xóa nhân viên thành công!",
    });
  } catch (err) {
    next(err);
  }
};
