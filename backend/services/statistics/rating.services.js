import {
  RatingModel,
  VariantModel,
  OrderDetailModel,
} from "../../models/index.js";
import { fn, col, literal } from "sequelize";

export const averageRatingService = async () => {
  const ratings = await RatingModel.findAll({
    attributes: [
      [col("ChiTietDonHang.BienTheSanPham.MaSanPham"), "MaSanPham"],
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
    group: ["ChiTietDonHang.BienTheSanPham.MaSanPham"],
    order: [
      [literal("DiemTrungBinh"), "DESC"],
      [literal("TongDanhGia"), "DESC"],
    ],
    limit: 10,
    raw: true,
  });

  return ratings;
};
