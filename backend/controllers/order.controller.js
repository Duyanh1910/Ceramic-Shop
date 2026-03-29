import {
  checkOutService,
  getMyOrderService,
  getMyOrderInfoService,
  cancelOrderService,
} from "../services/order.services.js";

export const createOrder = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const { items, ...orderData } = req.body;

    const checkOut = await checkOutService(idAccount, orderData, items);

    return res.status(201).json({
      success: true,
      message: "Tạo mới đơn hàng thành công!",
      result: checkOut,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const orders = await getMyOrderService(idAccount);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công!",
      result: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderInfo = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const { orderCode } = req.params;

    const orderInfo = await getMyOrderInfoService(idAccount, orderCode);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin đơn hàng thành công!",
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
