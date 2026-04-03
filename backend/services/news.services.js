import { StaffModel, NewsModel } from "../models/index.js";

export const getAllNewsService = async () => {
  const news = await NewsModel.findAll({
    where: {
      TrangThai: 1,
    },
  });
  return news;
};

export const getNewsContentService = async (id) => {
  const news = await NewsModel.findByPk(id);
  return news;
};
