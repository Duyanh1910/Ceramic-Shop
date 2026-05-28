import {
  exportRevenueXlsxService,
  getTotalRevenueService,
} from "../../services/statistics/total_revenue.services.js";
import ErrorHandler from "../../utils/error_handler.js";

const validateDateRange = (startDate, endDate) => {
  if (startDate && isNaN(Date.parse(startDate))) {
    throw new ErrorHandler("Định dạng ngày bắt đầu không hợp lệ!", 400);
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    throw new ErrorHandler("Định dạng ngày kết thúc không hợp lệ!", 400);
  }

  if (startDate && endDate && Date.parse(startDate) > Date.parse(endDate)) {
    throw new ErrorHandler(
      "Ngày bắt đầu không được lớn hơn ngày kết thúc!",
      400,
    );
  }

  if (startDate && Date.parse(startDate) > Date.now()) {
    throw new ErrorHandler("Ngày bắt đầu không thể ở tương lai!", 400);
  }
};

const formatDateParam = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;

const getCurrentQuarterDateRange = () => {
  const now = new Date();
  const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
  const endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0);

  return {
    startDate: formatDateParam(startDate),
    endDate: formatDateParam(endDate),
  };
};

const getTotalRevenue = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    validateDateRange(startDate, endDate);

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

export const exportRevenueXlsxController = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const shouldUseDefaultRange = !startDate || !endDate;
    const defaultRange = shouldUseDefaultRange
      ? getCurrentQuarterDateRange()
      : {};
    const exportQuery = {
      ...req.query,
      mode: shouldUseDefaultRange ? "quarter" : req.query.mode || "quarter",
      ...defaultRange,
    };

    validateDateRange(exportQuery.startDate, exportQuery.endDate);

    const buffer = await exportRevenueXlsxService(exportQuery);
    const fileName = `bao-cao-doanh-thu-${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export default getTotalRevenue;
