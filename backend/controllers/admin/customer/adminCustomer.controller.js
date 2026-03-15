import {
  getAllCustomersService,
  getCustomerService,
} from "../../../services/customer.service.js";
import ErrorHandler from "../../../middlewares/error.middlewares.js";
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
