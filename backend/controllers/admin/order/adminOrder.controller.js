import {
  adminGetOrderService,
  adminGetOrderDetailService,
} from "../../../services/order.services.js";

export const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      startDate = "",
      endDate = "",
    } = req.query;
    const orders = await adminGetOrderService(
      Number(page),
      Number(limit),
      search,
      status,
      startDate,
      endDate,
    );
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công!",
      result: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const orderInfo = await adminGetOrderDetailService(orderCode);
    return res.status(200).json({
      success: true,
      message: `Lấy thông tin chi tiết đơn hàng ${orderCode} thành công!`,
      result: orderInfo,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const { orderCode } = req.params;
    const { reason } = req.body;

    await cancelOrderService(idAccount, orderCode, reason);

    return res.status(200).json({
      success: true,
      message: "Đã hủy đơn hàng thành công và hoàn lại các ưu đãi!",
    });
  } catch (error) {
    next(error);
  }
};
