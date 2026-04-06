import { getTopSellingProductsService } from "../../services/statistics/best_seller.services.js";

const topSellingProducts = async (req, res, next) => {
  try {
    const result = await getTopSellingProductsService();
    return res.status(200).json({
      success: true,
      message: "Thống kê sản phẩm bán chạy thành công!",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};

export default topSellingProducts;
