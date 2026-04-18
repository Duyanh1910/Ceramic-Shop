import ErrorHandler from "../utils/error_handler.js";
import {
  getCartService,
  addCartItemsService,
  updateCartItemsService,
  deleteCartItemsService,
  deleteCartService,
  calculateSummaryService,
} from "../services/cart.services.js";
export const getCartController = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const cart = await getCartService(id);
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Giỏ hàng của bạn đang trống!",
        cart: null,
      });
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin giỏ hàng thành công!",
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const addCartItemsController = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const { MaBienThe, SoLuong } = req.body;
    const quantity = Number(SoLuong);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return next(new ErrorHandler("Số lượng sản phẩm phải là số dương!", 400));
    }
    if (Number.isNaN(MaBienThe) || Number(MaBienThe) <= 0) {
      return next(
        new ErrorHandler("Mã biến thể sản phẩm phải là số dương!", 400),
      );
    }
    const cart = await addCartItemsService(id, Number(MaBienThe), quantity);
    res.status(200).json({
      success: true,
      message: "Thêm sản phẩm vào giỏ hàng thành công!",
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCartItemsController = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const { SoLuong } = req.body;
    const quantity = Number(SoLuong);
    const MaBienThe = Number(req.params.id);
    if (Number.isNaN(quantity) || quantity < 0) {
      return next(new ErrorHandler("Số lượng sản phẩm phải là số dương!", 400));
    }
    if (Number.isNaN(MaBienThe) || MaBienThe <= 0) {
      return next(
        new ErrorHandler("Mã biến thể sản phẩm phải là số dương!", 400),
      );
    }
    const cart = await updateCartItemsService(id, Number(MaBienThe), quantity);
    res.status(200).json({
      success: true,
      message: "Sửa số lượng sản phẩm trong giỏ hàng thành công!",
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCartItemsController = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const MaBienThe = Number(req.params.id);
    if (Number.isNaN(MaBienThe) || MaBienThe <= 0) {
      return next(
        new ErrorHandler("Mã biến thể sản phẩm phải là số dương!", 400),
      );
    }
    const cart = await deleteCartItemsService(id, MaBienThe);
    if (!cart) {
      return next(new ErrorHandler("Giỏ hàng đang trống!", 404));
    }
    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm trong giỏ hàng thành công!",
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCartController = async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const cart = await deleteCartService(id);
    res.status(200).json({
      success: true,
      message: "Xóa toàn bộ sản phẩm trong giỏ hàng thành công!",
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const getCartSummary = async (req, res, next) => {
  try {
    console.log(req.body);
    const idAccount = req.user.id;
    const result = await calculateSummaryService(idAccount, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
