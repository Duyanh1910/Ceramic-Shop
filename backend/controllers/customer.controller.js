import { getAllCustomersService } from "../services/customer.service.js";
export const getCustomers = async (req, res, next) => {
  try {
    const users = await getAllCustomersService();
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
