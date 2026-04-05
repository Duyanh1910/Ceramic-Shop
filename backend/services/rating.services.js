import {
  RatingModel,
  CustomerModel,
  ProductModel,
  VariantModel,
  OrderDetailModel,
  OrderModel
} from "../models/index.js";
import { fn, col } from "sequelize";
import ErrorHandler from "../utils/error_handler.js";

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

export const createReviewsService = async (
  idAccount,
  idProduct,
  DiemDanhGia,
  NoiDung,
) => {
  try {
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }
    const purchasedItems = await OrderDetailModel.findAll({
      include: [
        {
          model: OrderModel,
          where: {
            MaKhachHang: customer.MaKhachHang,
            TrangThaiDonHang: 3,
          },
          attributes: ["MaDonHang"],
        },
        {
          model: VariantModel,
          where: { MaSanPham: idProduct },
          attributes: ["MaSanPham"],
        },
      ],
    });
    if (!purchasedItems || purchasedItems.length === 0) {
      throw new ErrorHandler(
        "Bạn cần mua sản phẩm này để có thể đánh giá!",
        403,
      );
    }
    const reviewedItems = await RatingModel.findAll({
      where: {
        MaKhachHang: customer.MaKhachHang,
      },
      attributes: ["MaCTDH"],
    });
    const reviewed = reviewedItems.map((item) => item.MaCTDH);
    const unreviewedItem = purchasedItems.find(
      (item) => !reviewed.includes(item.MaCTDH),
    );
    if (!unreviewedItem) {
      throw new ErrorHandler(
        "Bạn đã đánh giá sản phẩm này trong đơn hàng của bạn rồi!",
        409,
      );
    }
    const newReview = await RatingModel.create({
      MaKhachHang: customer.MaKhachHang,
      MaCTDH: unreviewedItem.MaCTDH,
      DiemDanhGia: DiemDanhGia,
      NoiDung: NoiDung || null,
      TrangThai: 1,
    });
    return newReview;
  } catch (error) {
    console.error(error);
    if (error.statusCode) throw error;
    throw new ErrorHandler(
      "Lỗi server! Không thể thêm mới đánh giá cho sản phẩm này!",
      500,
    );
  }
};
