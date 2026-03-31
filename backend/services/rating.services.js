import {
  RatingModel,
  CustomerModel,
  ProductModel,
  VariantModel,
  OrderDetailModel,
} from "../models/index.js";
import { fn, col } from "sequelize";

export const reviewsProductService = async (productID) => {
  const reviews = RatingModel.findAll({
    where: {
      TrangThai: 1,
    },
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: VariantModel,
            required: true,
            where: {
              MaSanPham: productID,
            },
          },
        ],
      },
      {
        model: CustomerModel,
        attributes: ["TenKhachHang", "Avatar"],
      },
    ],
  });
  return reviews;
};

export const averageRatingService = async (productID) => {
  const ratings = await RatingModel.findOne({
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
            where: { MaSanPham: productID },
          },
        ],
      },
    ],
    group: ["MaSanPham"],
    raw: true,
  });
  return ratings;
};
