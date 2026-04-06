import { getMostViewedProductsService } from "../../services/statistics/most_viewed_product.services.js";

const getMostViewedProducts = async (req, res, next) => {
  try {
    const result = await getMostViewedProductsService();
    return res.status(200).json({
      success: true,
      message: "Thống kê sản phẩm có lượt xem cao nhất thành công!",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};

export default getMostViewedProducts;
