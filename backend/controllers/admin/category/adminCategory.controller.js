import {
  getAllCategoriesService,
  getCategoryService,
  createCategoryService,
  deleteCategoryService,
  updateCategoryService,
} from "../../../services/category.service.js";
export const createCategoryController = async (req, res, next) => {
  try {
    const result = await createCategoryService(req.body);

    return res.status(201).json({
      success: true,
      message: "Thêm danh mục sản phẩm thành công!",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteCategoryService(id);

    return res.status(200).json({
      success: true,
      message: "Xóa danh mục sản phẩm thành công!",
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenDanhMuc, MoTa, ParentID } = req.body;

    const result = await updateCategoryService(id, TenDanhMuc, MoTa, ParentID);

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục sản phẩm thành công!",
      result,
    });
  } catch (error) {
    next(error);
  }
};

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
