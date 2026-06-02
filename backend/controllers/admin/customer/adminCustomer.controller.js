import {
  getAllCustomersService,
  getCustomerService,
  updateCustomerByAdminService,
  softDeleteCustomerAccountService,
} from "../../../services/customer.service.js";
import ErrorHandler from "../../../utils/error_handler.js";
import {
  isStringEmpty,
  isValidEmail,
  isValidPhoneNumber,
} from "../../../utils/helpers.js";

export const getCustomers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "MaKhachHang",
      order = "DESC",
    } = req.query;
    const users = await getAllCustomersService(
      Number(page),
      Number(limit),
      search,
      sort,
      order,
    );
    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách khách hàng thành công!",
      result: users,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getCustomerInfo = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    const user = await getCustomerService(id);
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

export const updateCustomerInfo = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }

    const {
      TenKhachHang,
      SDT,
      DiaChi,
      Avatar,
      Username,
      Password,
      Email,
      TrangThai,
    } = req.body;

    if (Username !== undefined || Password !== undefined) {
      return next(
        new ErrorHandler(
          "Admin không được sửa username hoặc password của khách hàng!",
          403,
        ),
      );
    }

    if (
      TenKhachHang !== undefined &&
      (isStringEmpty(TenKhachHang) || TenKhachHang.length > 100)
    ) {
      return next(new ErrorHandler("Tên khách hàng không hợp lệ!", 400));
    }
    if (
      SDT !== undefined &&
      SDT !== null &&
      SDT !== "" &&
      !isValidPhoneNumber(SDT)
    ) {
      return next(new ErrorHandler("Số điện thoại không hợp lệ!", 400));
    }
    if (
      DiaChi !== undefined &&
      DiaChi !== null &&
      String(DiaChi).length > 255
    ) {
      return next(new ErrorHandler("Địa chỉ không hợp lệ!", 400));
    }
    if (Email !== undefined && !isValidEmail(Email)) {
      return next(new ErrorHandler("Email không hợp lệ!", 400));
    }
    if (TrangThai !== undefined && ![0, 1].includes(Number(TrangThai))) {
      return next(new ErrorHandler("Trạng thái tài khoản không hợp lệ!", 400));
    }

    const data = {
      TenKhachHang,
      SDT,
      DiaChi,
      Avatar,
      Email: Email ? String(Email).trim().toLowerCase() : Email,
      TrangThai: TrangThai !== undefined ? Number(TrangThai) : undefined,
    };
    const filterData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined) acc[key] = data[key];
      return acc;
    }, {});

    if (Object.keys(filterData).length === 0) {
      return next(new ErrorHandler("Không có thông tin cần cập nhật!", 400));
    }

    const result = await updateCustomerByAdminService(id, filterData);
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin khách hàng thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const softDeleteCustomerAccount = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }

    await softDeleteCustomerAccountService(id);
    res.status(200).json({
      success: true,
      message:
        "Đã xóa tài khoản khách hàng. Đơn hàng liên quan không bị ảnh hưởng!",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
