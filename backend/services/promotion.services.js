import {
  CategoryModel,
  PromotionModel,
  PromotionTypeModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";

const promotionInclude = [
  {
    model: PromotionTypeModel,
    attributes: ["MaLoaiKM", "TenLoaiKM"],
    required: false,
  },
  {
    model: CategoryModel,
    attributes: ["MaDanhMuc", "TenDanhMuc", "ParentID"],
    required: false,
  },
];

const findPromotionWithRelations = async (MaKhuyenMai) => {
  return await PromotionModel.findByPk(MaKhuyenMai, {
    include: promotionInclude,
  });
};

const assertCategoryExists = async (MaDanhMuc) => {
  if (MaDanhMuc === null || MaDanhMuc === undefined) {
    return;
  }

  if (Number.isNaN(Number(MaDanhMuc))) {
    throw new ErrorHandler("Danh mục áp dụng không hợp lệ", 422);
  }

  const category = await CategoryModel.findByPk(MaDanhMuc);

  if (!category) {
    throw new ErrorHandler("Danh mục áp dụng không tồn tại", 422);
  }
};

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
    include: promotionInclude,
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getAllPromotionsAdminService = async () => {
  return await PromotionModel.findAll({
    include: promotionInclude,
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getPromotionByIDAdminService = async (MaKhuyenMai) => {
  const promotion = await findPromotionWithRelations(MaKhuyenMai);

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
  await assertCategoryExists(MaDanhMuc);

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

  return await findPromotionWithRelations(promotion.MaKhuyenMai);
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

  await assertCategoryExists(MaDanhMuc);

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

  return await findPromotionWithRelations(MaKhuyenMai);
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

  return await findPromotionWithRelations(MaKhuyenMai);
};