import {
  RatingModel,
  VariantModel,
  OrderDetailModel,
  ProductModel,
} from "../../models/index.js";
import { fn, col, literal } from "sequelize";

export const averageRatingService = async () => {
  const ratings = await RatingModel.findAll({
    attributes: [
      [col("ChiTietDonHang.BienTheSanPham.MaSanPham"), "MaSanPham"],
      [col("ChiTietDonHang.BienTheSanPham.SanPham.TenSanPham"), "TenSanPham"],
      [col("ChiTietDonHang.BienTheSanPham.SanPham.Thumbnail"), "Thumbnail"],
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
            include: [
              {
                model: ProductModel,
                required: true,
                attributes: [],
              },
            ],
          },
        ],
      },
    ],
    group: [
      "ChiTietDonHang.BienTheSanPham.MaSanPham",
      "ChiTietDonHang.BienTheSanPham.SanPham.TenSanPham",
      "ChiTietDonHang.BienTheSanPham.SanPham.Thumbnail",
    ],
    order: [
      [literal("DiemTrungBinh"), "DESC"],
      [literal("TongDanhGia"), "DESC"],
    ],
    limit: 10,
    raw: true,
  });

  return ratings;
};
