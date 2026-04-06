import { getDashboardOverviewService } from "../../services/statistics/overview.services.js";
import ErrorHandler from "../../utils/error_handler.js";
export const getOverviewStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      throw new ErrorHandler("Vui lòng cung cấp startDate và endDate", 400);
    }

    const data = await getDashboardOverviewService(startDate, endDate);

    return res.status(200).json({
      success: true,
      message: "Lấy dữ liệu tổng quan thành công",
      result: data,
    });
  } catch (error) {
    next(error);
  }
};
