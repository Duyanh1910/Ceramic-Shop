import {
  getAllNewsService,
  getNewsContentService,
} from "../services/news.services.js";

export const getAllNews = async (req, res, next) => {
  try {
    const news = await getAllNewsService();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách tin tức thành công!",
      result: news,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getNewsContent = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(`Mã tin tức: ${id}`);
    const news = await getNewsContentService(Number(id));
    res.status(200).json({
      success: true,
      message: "Lấy tin tức thành công!",
      result: news,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
