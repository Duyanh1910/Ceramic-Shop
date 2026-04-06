import { OrderModel, CustomerModel } from "../../models/index.js";
import { Op } from "sequelize";

export const getDashboardOverviewService = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const totalRevenue = await OrderModel.sum("TongThanhToan", {
    where: { TrangThaiThanhToan: 1, NgayDat: { [Op.between]: [start, end] } },
  });

  const totalOrders = await OrderModel.count({
    where: { NgayDat: { [Op.between]: [start, end] } },
  });

  const totalCustomers = await CustomerModel.count();
  const chartMap = {};
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    chartMap[dateLabel] = {
      label: dateLabel,
      revenue: 0,
      orders: 0,
      customers: 0,
    };
  }

  const orders = await OrderModel.findAll({
    attributes: ["TongThanhToan", "NgayDat", "TrangThaiThanhToan"],
    where: { NgayDat: { [Op.between]: [start, end] } },
    raw: true,
  });

  orders.forEach((order) => {
    const d = new Date(order.NgayDat);
    const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    if (chartMap[dateLabel]) {
      chartMap[dateLabel].orders += 1;
      if (order.TrangThaiThanhToan === 1) {
        chartMap[dateLabel].revenue += Number(order.TongThanhToan);
      }
    }
  });

  return {
    summary: {
      revenue: Number(totalRevenue) || 0,
      orders: totalOrders,
      customers: totalCustomers,
    },
    chartData: Object.values(chartMap),
  };
};
