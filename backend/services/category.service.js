import { CategoryModel } from "../models/index.js";
export const getAllCategoriesService = async () => {
  const categories = await CategoryModel.findAll({
    attributes: ["MaDanhMuc", "TenDanhMuc", "MoTa"],
    order: [["MaDanhMuc", "ASC"]],
  });
  return categories;
};

export const getCategoryService = async (id) => {
  const category = await CategoryModel.findByPk(id, {
    attributes: ["MaDanhMuc", "TenDanhMuc", "MoTa"],
  });
  return category;
};
