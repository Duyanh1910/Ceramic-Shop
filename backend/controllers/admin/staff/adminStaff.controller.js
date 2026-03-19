import {
  getAllStaffService,
  getStaffService,
} from "../../../services/staff.services.js";
import ErrorHandler from "../../../middlewares/error.middlewares.js";

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
