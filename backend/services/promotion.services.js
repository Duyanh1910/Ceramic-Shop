import {
  PromotionModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";

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

export const getPromotionByIDAdminService = async (MaKhuyenMai) => {
  const promotion = await PromotionModel.findByPk(MaKhuyenMai);

  if (!promotion) {
    throw new ErrorHandler("Mã này không tồn tại", 404);
  }

  return promotion;
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
  if (MaCode) {
    const isExist = await PromotionModel.findOne({
      where: {
        MaCode,
      },
    });

    if (isExist) {
      throw new ErrorHandler("Mã Code này đã tồn tại", 422);
    }
  }

  return await PromotionModel.create({
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
  const isExist = await PromotionModel.findByPk(MaKhuyenMai);

  if (!isExist) {
    throw new ErrorHandler("Mã này không tồn tại", 404);
  }

  if (MaCode) {
    const promo = await PromotionModel.findOne({
      where: {
        MaCode,
        MaKhuyenMai: {
          [Op.ne]: MaKhuyenMai,
        },
      },
    });

    if (promo) {
      throw new ErrorHandler("Mã Code này đã tồn tại", 422);
    }
  }

  await PromotionModel.update(
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
      where: {
        MaKhuyenMai,
      },
    },
  );

  return await PromotionModel.findByPk(MaKhuyenMai);
};

export const updatePromotionStatusService = async (
  MaKhuyenMai,
  TrangThai,
) => {
  const isExist = await PromotionModel.findByPk(MaKhuyenMai);

  if (!isExist) {
    throw new ErrorHandler("Mã này không tồn tại", 404);
  }

  await PromotionModel.update(
    {
      TrangThai,
    },
    {
      where: {
        MaKhuyenMai,
      },
    },
  );

  return await PromotionModel.findByPk(MaKhuyenMai);
};