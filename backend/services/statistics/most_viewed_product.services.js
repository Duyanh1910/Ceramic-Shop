import { ProductModel } from "../../models/index.js";
export const getMostViewedProductsService = async () => {
  const limit = 10;
  const mostViewed = await ProductModel.findAll({
    attributes: [
      "MaSanPham",
      "TenSanPham",
      "ThuongHieu",
      "LuotXem",
      "Thumbnail",
    ],
    order: [["LuotXem", "DESC"]],
    limit: limit,
    raw: true,
  });

  return mostViewed;
};
