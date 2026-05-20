import { CategoryModel, ProductModel } from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
export const getAllCategoriesService = async () => {
  const categories = await CategoryModel.findAll({
    attributes: ["MaDanhMuc", "TenDanhMuc", "ParentID", "MoTa"],
    order: [["MaDanhMuc", "ASC"]],
  });
  return categories;
};

export const getCategoryService = async (id) => {
  const category = await CategoryModel.findByPk(id, {
    attributes: ["MaDanhMuc", "TenDanhMuc", "ParentID", "MoTa"],
  });
  return category;
};

export const deleteCategoryService = async (MaDanhMuc) => {
  try {
    const category = await CategoryModel.findByPk(MaDanhMuc);

    if (!category) {
      throw new ErrorHandler("Danh mục sản phẩm không tồn tại", 404);
    }

    const childCategory = await CategoryModel.findOne({
      where: {
        ParentID: MaDanhMuc,
      },
    });

    if (childCategory) {
      throw new ErrorHandler(
        "Không thể xóa danh mục vì đang tồn tại danh mục con",
        400,
      );
    }

    const product = await ProductModel.findOne({
      where: {
        MaDanhMuc,
      },
    });

    if (product) {
      throw new ErrorHandler(
        "Không thể xóa danh mục vì đang tồn tại sản phẩm thuộc danh mục này",
        400,
      );
    }

    await category.destroy();

    return true;
  } catch (err) {
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi! Không thể xóa danh mục sản phẩm", 500);
  }
};

export const updateCategoryService = async (
  MaDanhMuc,
  TenDanhMuc,
  MoTa,
  ParentID,
) => {
  try {
    const category = await CategoryModel.findByPk(MaDanhMuc);

    if (!category) {
      throw new ErrorHandler("Danh mục sản phẩm không tồn tại", 404);
    }

    const categoryName = TenDanhMuc?.trim();

    if (!categoryName) {
      throw new ErrorHandler("Tên danh mục không được để trống", 400);
    }

    const existedCategory = await CategoryModel.findOne({
      where: {
        TenDanhMuc: categoryName,
        MaDanhMuc: {
          [Op.ne]: MaDanhMuc,
        },
      },
    });

    if (existedCategory) {
      throw new ErrorHandler("Tên danh mục đã tồn tại", 409);
    }

    const normalizedParentID =
      ParentID === undefined || ParentID === null || ParentID === ""
        ? null
        : Number(ParentID);

    if (normalizedParentID === Number(MaDanhMuc)) {
      throw new ErrorHandler(
        "Không thể chọn chính danh mục này làm danh mục cha",
        400,
      );
    }

    const hasChildren = await CategoryModel.findOne({
      where: {
        ParentID: MaDanhMuc,
      },
    });

    if (hasChildren && normalizedParentID !== null) {
      throw new ErrorHandler(
        "Không thể chuyển danh mục cha thành danh mục con vì đang tồn tại danh mục con",
        400,
      );
    }
    if (normalizedParentID !== null) {
      const parentCategory = await CategoryModel.findByPk(normalizedParentID);

      if (!parentCategory) {
        throw new ErrorHandler("Danh mục cha không tồn tại", 404);
      }

      if (parentCategory.ParentID !== null) {
        throw new ErrorHandler(
          "Không thể chọn danh mục con làm danh mục cha",
          400,
        );
      }
    }

    await category.update({
      TenDanhMuc: categoryName,
      MoTa: MoTa?.trim() || null,
      ParentID: normalizedParentID,
    });

    return category;
  } catch (err) {
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi! Không thể cập nhật danh mục sản phẩm", 500);
  }
};

export const createCategoryService = async ({ TenDanhMuc, MoTa, ParentID }) => {
  try {
    const categoryName = TenDanhMuc?.trim();

    if (!categoryName) {
      throw new ErrorHandler("Tên danh mục không được để trống", 400);
    }

    const existedCategory = await CategoryModel.findOne({
      where: {
        TenDanhMuc: categoryName,
      },
    });

    if (existedCategory) {
      throw new ErrorHandler("Tên danh mục đã tồn tại", 409);
    }

    const normalizedParentID =
      ParentID === undefined || ParentID === null || ParentID === ""
        ? null
        : Number(ParentID);

    if (normalizedParentID !== null) {
      const parentCategory = await CategoryModel.findByPk(normalizedParentID);

      if (!parentCategory) {
        throw new ErrorHandler("Danh mục cha không tồn tại", 404);
      }

      if (parentCategory.ParentID !== null) {
        throw new ErrorHandler(
          "Không thể chọn danh mục con làm danh mục cha",
          400,
        );
      }
    }

    const newCategory = await CategoryModel.create({
      TenDanhMuc: categoryName,
      MoTa: MoTa?.trim() || null,
      ParentID: normalizedParentID,
    });

    return newCategory;
  } catch (err) {
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi! Không thể thêm danh mục sản phẩm", 500);
  }
};
