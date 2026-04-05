import {
  RatingModel,
  CustomerModel,
  ProductModel,
  VariantModel,
  OrderDetailModel,
} from "../../models/index.js";
import { fn, col } from "sequelize";

export const averageRatingService = async () => {
  const ratings = await RatingModel.findAll({
    attributes: [
      [fn("avg", col("DiemDanhGia")), "DiemTrungBinh"],
      [fn("count", col("MaDanhGia")), "TongDanhGia"],
    ],
    include: [
      {
        model: OrderDetailModel,
        attributes: [],
        required: true,
        include: [
          {
            model: VariantModel,
            required: true,
            attributes: [],
          },
        ],
      },
    ],
    group: ["MaSanPham"],
    order: [["DiemTrungBinh", DESC]],
    raw: true,
  });
  return ratings;
};
