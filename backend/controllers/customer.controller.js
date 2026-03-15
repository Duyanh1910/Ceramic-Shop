import { updateCustomerMeService } from "../services/customer.service.js";
import ErrorHandler from "../utils/error_handler.js";
import { isValidPhoneNumber } from "../utils/helpers.js";
export const updateCustomerMe = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const { TenKhachHang, SDT, DiaChi, Avatar } = req.body;
    if (SDT !== undefined && !isValidPhoneNumber(SDT)) {
      return next(new ErrorHandler("Số điện thoại không hợp lệ!", 400));
    }
    const data = {
      TenKhachHang,
      SDT,
      DiaChi,
      Avatar,
    };
    const filterData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    if (Object.keys(filterData).length === 0) {
      return next(
        new ErrorHandler("Không thể cập nhật thông tin khách hàng!", 400),
      );
    }
    const result = await updateCustomerMeService(id, filterData);
    if (!result) {
      return next(
        new ErrorHandler("Không thể cập nhật thông tin khách hàng!", 400),
      );
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin khách hàng thành công!",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};
