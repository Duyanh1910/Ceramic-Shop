import { StaffModel, NewsModel } from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";

export const getAllNewsService = async () => {
  const news = await NewsModel.findAll({
    where: {
      TrangThai: 1,
    },
    include: [
      {
        model: StaffModel,
        attributes: ["TenNhanVien"],
      },
    ],
    order: [["NgayTao", "DESC"]],
  });
  return news;
};

export const getNewsContentService = async (id) => {
  const news = await NewsModel.findOne({
    where: {
      MaTinTuc: id,
      TrangThai: 1,
    },
    include: [
      {
        model: StaffModel,
        attributes: ["TenNhanVien"],
      },
    ],
  });
  return news;
};

export const getAllNewsAdminService = async () => {
  const news = await NewsModel.findAll({
    include: [
      {
        model: StaffModel,
        attributes: ["TenNhanVien"],
      },
    ],
    order: [["NgayTao", "DESC"]],
  });
  return news;
};

export const getNewsContentAdminService = async (id) => {
  const news = await NewsModel.findOne({
    where: {
      MaTinTuc: id,
    },
    include: [
      {
        model: StaffModel,
        attributes: ["TenNhanVien"],
      },
    ],
  });
  return news;
};

export const updateNewsStatusService = async (id, status) => {
  const news = await NewsModel.findOne({
    where: {
      MaTinTuc: id,
    },
  });
  if (!news) {
    throw new ErrorHandler("Không tìm thấy bài viết này!", 404);
  }
  await news.update({
    TrangThai: status,
  });
  return news;
};
