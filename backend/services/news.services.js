import { StaffModel, NewsModel } from "../models/index.js";

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
