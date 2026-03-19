import { updateStaffMeService } from "../services/staff.services.js";
import ErrorHandler from "../utils/error_handler.js";
import { isValidPhoneNumber, isValidDate } from "../utils/helpers.js";
export const updateStaffMe = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const { TenNhanVien, SDT, DiaChi, NgaySinh } = req.body;
    if (SDT !== undefined && !isValidPhoneNumber(SDT)) {
      return next(new ErrorHandler("Số điện thoại không hợp lệ!", 400));
    }
    if (NgaySinh !== undefined) {
      const dob = new Date(NgaySinh);
      if (!isValidDate(dob) || dob > Date.now()) {
        return next(new ErrorHandler("Ngày sinh không hợp lệ!", 400));
      }
    }
    const data = {
      TenNhanVien,
      SDT,
      DiaChi,
      NgaySinh,
    };
    const filterData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    if (Object.keys(filterData).length === 0) {
      return next(
        new ErrorHandler("Không thể cập nhật thông tin nhân viên!", 400),
      );
    }
    const result = await updateStaffMeService(id, filterData);
    if (!result) {
      return next(
        new ErrorHandler("Không thể cập nhật thông tin nhân viên!", 400),
      );
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin nhân viên thành công!",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};
