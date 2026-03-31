import {
  reviewsProductService,
  averageRatingService,
} from "../services/rating.services.js";
import ErrorHandler from "../utils/error_handler.js";

export const reviewsProductController = async (req, res, next) => {
  try {
    const productID = Number(req.params.id);
    console.log(productID);
    if (!Number.isInteger(productID)) {
      throw new ErrorHandler("ID sản phẩm không hợp lệ!", 400);
    }
    const reviews = await reviewsProductService(productID);
    res.status(200).json({
      success: true,
      message: "Lấy đánh giá sản phẩm thành công",
      result: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const ratingProductController = async (req, res, next) => {
  try {
    const productID = Number(req.params.id);
    console.log(productID);
    if (!Number.isInteger(productID)) {
      throw new ErrorHandler("ID sản phẩm không hợp lệ!", 400);
    }
    const reviews = await averageRatingService(productID);
    res.status(200).json({
      success: true,
      message: "Lấy điểm đánh giá sản phẩm thành công!",
      result: reviews,
    });
  } catch (err) {
    next(err);
  }
};
