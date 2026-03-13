import { getAllProductsService } from "../services/product.service.js";
import ErrorHandler from "../utils/error_handler.js";
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "MaSanPham",
      order = "DESC",
      category = null,
    } = req.query;
    const products = await getAllProductsService(
      Number(page),
      Number(limit),
      search,
      sort,
      order,
      category ? Number(category) : null,
    );
    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách sản phẩm thành công!",
      result: products,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
