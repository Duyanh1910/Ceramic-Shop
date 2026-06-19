import {
  checkOutService,
  getMyOrderService,
  getMyOrderInfoService,
  cancelOrderService,
} from "../services/order.services.js";
import ErrorHandler from "../utils/error_handler.js";
import { CustomerModel } from "../models/index.js";
import calculateShippingFee from "../utils/orders/calculate_shipping_fee.js";
import calculateOrderDiscount from "../utils/orders/calculate_order_discount.js";
import calculateProduct from "../utils/orders/calculate_product_fee.js";

export const createOrder = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const { orderData, selectedVariantIds } = req.body;
    const checkOut = await checkOutService(
      idAccount,
      orderData,
      selectedVariantIds,
    );
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

export const calculateFee = async (req, res, next) => {
  try {
    const { items, addressObj, MaPhi } = req.body;
    if (!items || !addressObj || !MaPhi)
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    const productData = await calculateProduct(items);
    const feeResult = await calculateShippingFee(
      productData.items,
      addressObj,
      MaPhi,
      productData.total,
    );
    return res.status(200).json({
      success: true,
      message: "Tính phí giao hàng thành công!",
      feeResult,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateDiscount = async (req, res, next) => {
  try {
    const { listCode, items, addressObj, MaPhi } = req.body;
    const idAccount = req.user.id;
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
    });
    if (!customer) {
      return next(new ErrorHandler("Không tồn tại khách hàng này", 404));
    }
    if (!items || !addressObj || !MaPhi) {
      return next(new ErrorHandler("Dữ liệu đầu vào không hợp lệ", 400));
    }
    const totalProductFee = await calculateProduct(items);
    const shippingFee = await calculateShippingFee(
      items,
      addressObj,
      Number(MaPhi),
      totalProductFee,
    );
    const result = await calculateOrderDiscount(
      listCode,
      customer.MaKhachHang,
      totalProductFee,
      Number(shippingFee),
      items,
      Number(MaPhi),
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const calculateProductFee = async (req, res, next) => {
  try {
    const { items } = req.body;
    const total = await calculateProduct(items);
    return res.status(200).json({
      success: true,
      message: "Tính tiền sản phẩm thành công!",
      total,
    });
  } catch (error) {
    next(error);
  }
};
