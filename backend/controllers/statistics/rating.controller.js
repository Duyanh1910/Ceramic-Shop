import { averageRatingService } from "../../services/statistics/rating.services.js";

const ratingProductController = async (req, res, next) => {
  try {
    const reviews = await averageRatingService();
    res.status(200).json({
      success: true,
      message: "Lấy điểm đánh giá sản phẩm thành công!",
      result: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export default ratingProductController;
