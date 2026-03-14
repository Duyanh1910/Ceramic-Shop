import {
  getAllCategoriesService,
  getCategoryService,
} from "../services/category.service.js";
import ErrorHandler from "../utils/error_handler.js";
export const getCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategoriesService();
    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách danh mục sản phẩm thành công!",
      result: categories,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getCategoryInfo = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    const category = await getCategoryService(id);
    if (!category) {
      return next(new ErrorHandler("ID không tồn tại!", 404));
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh mục thành công!",
      result: category,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
