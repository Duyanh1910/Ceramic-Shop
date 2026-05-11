import {
  CustomerModel,
  PromotionModel,
  PromotionTypeModel,
  PromotionWalletModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Sequelize, Op } from "sequelize";

export const getAllPromotionsService = async () => {
  const now = new Date();
  return await PromotionModel.findAll({
    where: {
      TrangThai: 1,
      NgayBatDau: {
        [Op.lte]: now,
      },
      NgayKetThuc: {
        [Op.gte]: now,
      },
    },
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getAllPromotionsAdminService = async () => {
  return await PromotionModel.findAll({
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getPromotionByIDAdminService = async (id) => {
  return await PromotionModel.findByPk(id);
};

export const createPromotionService = async (
  MaLoaiKM,
  TenKhuyenMai,
  GiaTri,
  GiaTriToiThieu,
  GiamToiDa,
  NgayBatDau,
  NgayKetThuc,
  TrangThai,
  MaCode,
  SoLuong,
  LoaiVoucher,
  MaDanhMuc,
) => {
  try {
    const isExist = await PromotionModel.findOne({
      where: {
        MaCode: MaCode,
      },
    });
    if (isExist) {
      throw new ErrorHandler("Mã Code này đã tồn tại", 422);
    }
    const promotion = await PromotionModel.create({
      MaLoaiKM,
      TenKhuyenMai,
      GiaTri,
      GiaTriToiThieu,
      GiamToiDa,
      NgayBatDau,
      NgayKetThuc,
      TrangThai,
      MaCode,
      SoLuong,
      LoaiVoucher,
      MaDanhMuc,
    });
    return promotion;
  } catch (err) {
    throw new ErrorHandler("Lỗi! Không thể tạo mới khuyến mãi", 500);
  }
};

export const updatePromotionService = async (
  MaKhuyenMai,
  MaLoaiKM,
  TenKhuyenMai,
  GiaTri,
  GiaTriToiThieu,
  GiamToiDa,
  NgayBatDau,
  NgayKetThuc,
  TrangThai,
  MaCode,
  SoLuong,
  LoaiVoucher,
  MaDanhMuc,
) => {
  try {
    const isExist = await PromotionModel.findByPk(MaKhuyenMai);
    if (!isExist) {
      throw new ErrorHandler("Mã này không tồn tại", 404);
    }
    const promo = await PromotionModel.findOne({
      where: {
        MaCode: MaCode,
        MaKhuyenMai: {
          [Op.ne]: MaKhuyenMai,
        },
      },
    });
    if (promo) {
      throw new ErrorHandler("Mã Code này đã tồn tại", 422);
    }
    const promotion = await PromotionModel.update(
      {
        MaLoaiKM,
        TenKhuyenMai,
        GiaTri,
        GiaTriToiThieu,
        GiamToiDa,
        NgayBatDau,
        NgayKetThuc,
        TrangThai,
        MaCode,
        SoLuong,
        LoaiVoucher,
        MaDanhMuc,
      },
      {
        where: MaKhuyenMai,
      },
    );
    return promotion;
  } catch (err) {
    throw new ErrorHandler("Lỗi! Không thể cập nhật khuyến mãi", 500);
  }
};

export const updatePromotionStatusService = async (
  MaKhuyenMai,
  TrangThai,
) => {
  try {
    const isExist = await PromotionModel.findByPk(MaKhuyenMai);
    if (!isExist) {
      throw new ErrorHandler("Mã này không tồn tại", 404);
    }
    const promotion = await PromotionModel.update(
      {
        TrangThai,
      },
      {
        where: MaKhuyenMai,
      },
    );
    return promotion;
  } catch (err) {
    throw new ErrorHandler(
      "Lỗi! Không thể cập nhật trạng thái khuyến mãi",
      500,
    );
  }
};
