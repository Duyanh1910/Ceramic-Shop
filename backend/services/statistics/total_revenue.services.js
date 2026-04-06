import { OrderModel } from "../../models/index.js";
import { Op } from "sequelize";

export const getTotalRevenueService = async (startDate, endDate) => {
  const whereCondition = {
    TrangThaiThanhToan: 1,
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    whereCondition.NgayDat = {
      [Op.between]: [start, end],
    };
  }

  const totalRevenue = await OrderModel.sum("TongThanhToan", {
    where: whereCondition,
  });

  return Number(totalRevenue) || 0;
};
