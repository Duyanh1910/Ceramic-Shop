import {
  OrderModel,
  ProductModel,
  VariantModel,
  OrderDetailModel,
  sequelize,
} from "../../models/index.js";
import { fn, col, literal, Op } from "sequelize";

export const getTopSellingProductsService = async () => {
  const limit = 10;
  const topProducts = await OrderDetailModel.findAll({
    attributes: [
      [col("BienTheSanPham.SanPham.MaSanPham"), "MaSanPham"],
      [col("BienTheSanPham.SanPham.TenSanPham"), "TenSanPham"],
      [fn("SUM", col("ChiTietDonHang.SoLuong")), "TongDaBan"],
    ],
    include: [
      {
        model: OrderModel,
        attributes: [],
        where: {
          TrangThaiThanhToan: 1,
        },
      },
      {
        model: VariantModel,
        attributes: [],
        include: [
          {
            model: ProductModel,
            attributes: [],
          },
        ],
      },
    ],
    group: [
      "BienTheSanPham.SanPham.MaSanPham",
      "BienTheSanPham.SanPham.TenSanPham",
    ],
    order: [[literal("TongDaBan"), "DESC"]],
    limit: limit,
    raw: true,
  });
  if (!topProducts || topProducts.length === 0) return [];

  const topProductIds = topProducts.map((p) => p.MaSanPham);
  const variantSales = await OrderDetailModel.findAll({
    attributes: [
      [col("BienTheSanPham.MaSanPham"), "MaSanPham"],
      [col("BienTheSanPham.MaBienThe"), "MaBienThe"],
      [col("BienTheSanPham.TenBienThe"), "TenBienThe"],
      [fn("SUM", col("ChiTietDonHang.SoLuong")), "SoLuongBan"],
    ],
    include: [
      {
        model: OrderModel,
        attributes: [],
        where: {
          TrangThaiThanhToan: 1,
        },
      },
      {
        model: VariantModel,
        attributes: [],
        where: {
          MaSanPham: {
            [Op.in]: topProductIds,
          },
        },
      },
    ],
    group: [
      "BienTheSanPham.MaSanPham",
      "BienTheSanPham.MaBienThe",
      "BienTheSanPham.TenBienThe",
    ],
    raw: true,
  });
  const result = topProducts.map((product) => {
    const variants = variantSales.filter(
      (v) => v.MaSanPham === product.MaSanPham,
    );
    return {
      MaSanPham: product.MaSanPham,
      TenSanPham: product.TenSanPham,
      TongDaBan: Number(product.TongDaBan),
      ChiTietBienThe: variants.map((v) => ({
        MaBienThe: v.MaBienThe,
        TenBienThe: v.TenBienThe || null,
        SoLuongBan: Number(v.SoLuongBan),
      })),
    };
  });
  return result;
};
