import {
  PromotionModel,
  PromotionTypeModel,
  PromotionWalletModel,
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
  const wallets = await PromotionWalletModel.findAll({
    where: {
      MaKhachHang: idCustomer,
      MaKhuyenMai: {
        [Op.in]: listCode,
      },
      TrangThaiSuDung: 0,
    },
    include: [
      {
        model: PromotionModel,
      },
    ],
  });
  if (wallets.length !== listCode.length) {
    throw new ErrorHandler(
      "Có mã khuyến mãi không hợp lệ, không tồn tại trong ví hoặc đã được sử dụng!",
      400,
    );
  }
  const promotions = wallets.map((w) => w.KhuyenMai);

  const orderVouchers = promotions.filter((p) => p.LoaiVoucher === 1);
  const shipVouchers = promotions.filter((p) => p.LoaiVoucher === 2);

  if (orderVouchers.length > 1 || shipVouchers.length > 1) {
    throw new ErrorHandler(
      "Chỉ được áp dụng tối đa 1 mã giảm giá đơn hàng và 1 mã miễn phí vận chuyển!",
      400,
    );
  }
  const now = new Date();
  if (orderVouchers.length === 1) {
    const p = orderVouchers[0];

    if (p.SoLuong <= 0)
      throw new ErrorHandler(`Mã ${p.MaCode} đã hết lượt sử dụng!`, 400);
    if (now < new Date(p.NgayBatDau) || now > new Date(p.NgayKetThuc)) {
      throw new ErrorHandler(
        `Mã ${p.MaCode} đã hết hạn hoặc chưa đến thời gian áp dụng!`,
        400,
      );
    }

    if (totalProductPrice < Number(p.GiaTriToiThieu)) {
      throw new ErrorHandler(
        `Đơn hàng chưa đạt tối thiểu ${Number(p.GiaTriToiThieu).toLocaleString()}đ để dùng mã ${p.MaCode}`,
        400,
      );
    }

    let applicableValue = totalProductPrice;

    if (p.MaDanhMuc) {
      applicableValue = cartItems.reduce((sum, item) => {
        const catId = item.BienTheSanPham?.SanPham?.MaDanhMuc;
        if (catId === p.MaDanhMuc) {
          return sum + Number(item.BienTheSanPham.Gia) * item.SoLuong;
        }
        return sum;
      }, 0);

      if (applicableValue < Number(p.GiaTriToiThieu)) {
        throw new ErrorHandler(
          `Tổng các sản phẩm thuộc danh mục áp dụng mã ${p.MaCode} chưa đạt tối thiểu!`,
          400,
        );
      }
    }

    if (p.MaLoaiKM === 1) {
      let discount = (applicableValue * Number(p.GiaTri)) / 100;
      if (p.GiamToiDa) {
        discount =
          discount > Number(p.GiamToiDa) ? Number(p.GiamToiDa) : discount;
      }
      orderDiscount = discount;
    } else if (p.MaLoaiKM === 2) {
      orderDiscount = Number(p.GiaTri);
    }
    orderDiscount =
      orderDiscount > applicableValue ? applicableValue : orderDiscount;
    validPromotions.push(p);
  }

  if (shipVouchers.length === 1) {
    const p = shipVouchers[0];
    if (Number(MaPhi) === 3 || shippingFee === 0) {
      throw new ErrorHandler(
        "Không thể áp dụng mã Freeship khi bạn chọn phương thức Nhận tại cửa hàng!",
        400,
      );
    }
    if (p.SoLuong <= 0)
      throw new ErrorHandler(`Mã Freeship ${p.MaCode} đã hết lượt!`, 400);
    if (now < new Date(p.NgayBatDau) || now > new Date(p.NgayKetThuc)) {
      throw new ErrorHandler(
        `Mã Freeship ${p.MaCode} không trong thời gian sử dụng!`,
        400,
      );
    }
    if (totalProductPrice < Number(p.GiaTriToiThieu)) {
      throw new ErrorHandler(
        `Đơn hàng chưa đạt tối thiểu ${Number(p.GiaTriToiThieu).toLocaleString()}đ để dùng Freeship`,
        400,
      );
    }

    let discount = Number(p.GiaTri);
    if (p.GiamToiDa) {
      discount =
        discount > Number(p.GiamToiDa) ? Number(p.GiamToiDa) : discount;
    }

    shippingDiscount = discount > shippingFee ? shippingFee : discount;
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
