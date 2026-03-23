import ErrorHandler from "../utils/error_handler.js";
import {
  getCartService,
  addCartItemsService,
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
    const cart = await addCartItemsService(id, MaBienThe, SoLuong);
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Giỏ hàng của bạn đang trống!",
        cart: null,
      });
    }
    res.status(200).json({
      success: true,
      message: "Thêm sản phẩm vào giỏ hàng thành công!",
      cart,
    });
  } catch (err) {
    next(err);
  }
};
