import { getTotalRevenueService } from "../../services/statistics/total_revenue.services.js";
import ErrorHandler from "../../utils/error_handler.js";
const getTotalRevenue = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    if (startDate && isNaN(Date.parse(startDate))) {
      throw new ErrorHandler("Định dạng ngày bắt đầu không hợp lệ!", 400);
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      throw new ErrorHandler("Định dạng ngày kết thúc không hợp lệ!", 400);
    }
    if (startDate && endDate) {
      if (Date.parse(startDate) > Date.parse(endDate)) {
        throw new ErrorHandler(
          "Ngày bắt đầu không được lớn hơn ngày kết thúc!",
          400,
        );
      }
    }
    if (startDate && Date.parse(startDate) > Date.now()) {
      throw new ErrorHandler("Ngày bắt đầu không thể ở tương lai!", 400);
    }
    const result = await getTotalRevenueService(startDate, endDate);
    return res.status(200).json({
      success: true,
      message: "Thống kê doanh thu thành công!",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};

export default getTotalRevenue;
