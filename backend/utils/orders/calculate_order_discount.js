import {
  PromotionModel,
  PromotionWalletModel,
  VariantModel,
  ProductModel,
} from "../../models/index.js";
import ErrorHandler from "../error_handler.js";
import { Op } from "sequelize";

export const calculateOrderDiscount = async (
  listCode,
  idCustomer,
  totalProductPrice,
  shippingFee,
  cartItems,
  MaPhi,
) => {
  let orderDiscount = 0;
  let shippingDiscount = 0;
  let validPromotions = [];

  if (!listCode || !Array.isArray(listCode) || listCode.length === 0) {
    return {
      totalDiscount: 0,
      orderDiscount,
      shippingDiscount,
      validPromotions,
    };
  }

  const variantIds = cartItems.map((item) => item.id || item.MaBienThe);
  const variantsFromDB = await VariantModel.findAll({
    where: { MaBienThe: { [Op.in]: variantIds } },
    include: [
      { model: ProductModel, as: "SanPham", attributes: ["MaDanhMuc"] },
    ],
  });

  const variantMap = {};
  variantsFromDB.forEach((v) => (variantMap[v.MaBienThe] = v));

  const wallets = await PromotionWalletModel.findAll({
    where: {
      MaKhachHang: idCustomer,
      MaKhuyenMai: { [Op.in]: listCode },
      TrangThaiSuDung: 0,
    },
    include: [{ model: PromotionModel }],
  });

  if (wallets.length !== listCode.length) {
    throw new ErrorHandler(
      "Có mã khuyến mãi không hợp lệ hoặc đã được sử dụng!",
      400,
    );
  }

  const promotions = wallets.map((w) => w.KhuyenMai);
  const orderVouchers = promotions.filter((p) => p.LoaiVoucher === 1);
  const shipVouchers = promotions.filter((p) => p.LoaiVoucher === 2);

  if (orderVouchers.length > 1 || shipVouchers.length > 1) {
    throw new ErrorHandler(
      "Chỉ được áp dụng tối đa 1 mã giảm giá và 1 mã freeship!",
      400,
    );
  }

  const now = new Date();

  if (orderVouchers.length === 1) {
    const p = orderVouchers[0];

    if (p.SoLuong <= 0)
      throw new ErrorHandler(`Mã ${p.MaCode} đã hết lượt!`, 400);
    if (now < new Date(p.NgayBatDau) || now > new Date(p.NgayKetThuc))
      throw new ErrorHandler(`Mã ${p.MaCode} đã hết hạn!`, 400);
    if (totalProductPrice < Number(p.GiaTriToiThieu))
      throw new ErrorHandler(
        `Đơn hàng chưa đạt tối thiểu ${Number(p.GiaTriToiThieu).toLocaleString()}đ`,
        400,
      );

    let applicableValue = totalProductPrice;

    if (p.MaDanhMuc) {
      applicableValue = cartItems.reduce((sum, item) => {
        const variant = variantMap[item.id || item.MaBienThe];
        if (variant && variant.SanPham?.MaDanhMuc === p.MaDanhMuc) {
          return (
            sum + Number(variant.Gia) * Number(item.soLuong || item.SoLuong)
          );
        }
        return sum;
      }, 0);

      if (applicableValue < Number(p.GiaTriToiThieu)) {
        throw new ErrorHandler(
          `Sản phẩm thuộc danh mục chưa đạt tối thiểu để dùng mã ${p.MaCode}!`,
          400,
        );
      }
    }

    if (p.MaLoaiKM === 1) {
      let discount = (applicableValue * Number(p.GiaTri)) / 100;
      orderDiscount = p.GiamToiDa
        ? Math.min(discount, Number(p.GiamToiDa))
        : discount;
    } else {
      orderDiscount = Number(p.GiaTri);
    }
    orderDiscount = Math.min(orderDiscount, applicableValue);
    validPromotions.push(p);
  }

  if (shipVouchers.length === 1) {
    const p = shipVouchers[0];
    if (Number(MaPhi) === 3 || shippingFee === 0)
      throw new ErrorHandler(
        "Không áp dụng Freeship khi Nhận tại cửa hàng!",
        400,
      );
    if (p.SoLuong <= 0)
      throw new ErrorHandler(`Mã ${p.MaCode} đã hết lượt!`, 400);
    if (now < new Date(p.NgayBatDau) || now > new Date(p.NgayKetThuc))
      throw new ErrorHandler(`Mã ${p.MaCode} hết hạn!`, 400);
    if (totalProductPrice < Number(p.GiaTriToiThieu))
      throw new ErrorHandler(`Đơn hàng chưa đạt tối thiểu cho Freeship`, 400);

    let discount = Number(p.GiaTri);
    shippingDiscount = p.GiamToiDa
      ? Math.min(discount, Number(p.GiamToiDa))
      : discount;
    shippingDiscount = Math.min(shippingDiscount, shippingFee);
    validPromotions.push(p);
  }

  return {
    totalDiscount: orderDiscount + shippingDiscount,
    orderDiscount,
    shippingDiscount,
    validPromotions,
  };
};

export default calculateOrderDiscount;
