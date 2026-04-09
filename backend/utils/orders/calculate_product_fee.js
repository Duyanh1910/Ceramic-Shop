import { Op } from "sequelize";
import {
  CartModel,
  CartInfoModel,
  VariantModel,
  ProductModel,
} from "../../models/index.js";
import ErrorHandler from "../error_handler.js";

const calculateProduct = async (idCustomer, selectedVariantIds) => {
  if (
    !selectedVariantIds ||
    !Array.isArray(selectedVariantIds) ||
    selectedVariantIds.length === 0
  ) {
    return { items: [], total: 0 };
  }
  const cart = await CartModel.findOne({
    where: { MaKhachHang: idCustomer },
    include: [
      {
        model: CartInfoModel,
        where: { MaBienThe: { [Op.in]: selectedVariantIds } },
        include: [
          {
            model: VariantModel,
            as: "BienTheSanPham",
            include: [
              {
                model: ProductModel,
                as: "SanPham",
                attributes: ["MaDanhMuc"],
              },
            ],
          },
        ],
      },
    ],
  });

  const cartItems = cart?.CartInfoModels || cart?.ChiTietGioHangs;

  if (!cartItems || cartItems.length === 0) {
    throw new ErrorHandler(
      "Sản phẩm không tồn tại trong giỏ hàng hoặc đã bị xóa!",
      400,
    );
  }

  let totalSum = 0;
  const detailedItems = [];

  for (const item of cartItems) {
    const variant = item.BienTheSanPham;
    const soLuongTrongGio = item.SoLuong;

    if (!variant || variant.SoLuong < soLuongTrongGio) {
      throw new ErrorHandler(
        `Sản phẩm (ID: ${variant.MaBienThe}) không đủ số lượng tồn kho!`,
        400,
      );
    }

    const donGia = Number(variant.Gia);
    totalSum += donGia * soLuongTrongGio;
    detailedItems.push({
      MaBienThe: variant.MaBienThe,
      soLuong: soLuongTrongGio,
      donGia: donGia,
      MaDanhMuc: variant.SanPham?.MaDanhMuc,
      KhoiLuong: Number(variant.KhoiLuong || 0.5),
      ChieuDai: Number(variant.ChieuDai || 0),
      ChieuRong: Number(variant.ChieuRong || 0),
      ChieuCao: Number(variant.ChieuCao || 0),
    });
  }

  return { items: detailedItems, total: totalSum };
};

export default calculateProduct;
