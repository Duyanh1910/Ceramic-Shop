import {
  CustomerModel,
  PromotionModel,
  PromotionTypeModel,
  PromotionWalletModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
export const getMyVouchersService = async (id) => {
  const customer = await CustomerModel.findOne({
    where: {
      MaTaiKhoan: id,
    },
  });
  if (!customer) {
    throw new ErrorHandler("Không tìm thấy khách hàng này!", 400);
  }
  const now = new Date();
  return await PromotionWalletModel.findAll({
    where: {
      MaKhachHang: customer.MaKhachHang,
      TrangThaiSuDung: 0,
    },
    include: [
      {
        model: PromotionModel,
        where: {
          TrangThai: 1,
          NgayBatDau: {
            [Op.lte]: now,
          },
          NgayKetThuc: {
            [Op.gte]: now,
          },
        },
        required: true,
      },
    ],
    order: [["NgayLuu", "DESC"]],
  });
};

export const saveVouchersService = async (id, idPromotion) => {
  const customer = await CustomerModel.findOne({
    where: {
      MaTaiKhoan: id,
    },
  });
  if (!customer) {
    throw new ErrorHandler("Không tìm thấy khách hàng này!", 400);
  }
  const promo = await PromotionModel.findByPk(idPromotion);
  if (!promo) {
    throw new ErrorHandler("Không tồn tại mã khuyến mãi này!", 400);
  }
  const isExist = await PromotionWalletModel.findOne({
    where: {
      MaKhuyenMai: idPromotion,
      MaKhachHang: customer.MaKhachHang,
    },
  });
  if (isExist) {
    throw new ErrorHandler("Bạn đã lưu mã này rồi!", 400);
  }
  const now = new Date();
  if (promo.TrangThai !== 1)
    throw new ErrorHandler("Voucher đã bị vô hiệu hóa hoặc hết hạn!", 400);
  if (promo.NgayBatDau > now)
    throw new ErrorHandler("Chưa tới thời gian lưu mã!", 400);
  if (promo.NgayKetThuc < now)
    throw new ErrorHandler("Đã hết hạn lưu mã!", 400);
  if (promo.SoLuong <= 0) throw new ErrorHandler("Hết lượt lưu mã!", 400);
  return await PromotionWalletModel.create({
    MaKhachHang: customer.MaKhachHang,
    MaKhuyenMai: idPromotion,
  });
};
