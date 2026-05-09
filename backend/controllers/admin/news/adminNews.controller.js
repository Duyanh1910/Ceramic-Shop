import {
  getAllNewsAdminService,
  getNewsContentAdminService,
  updateNewsStatusService,
} from "../../../services/news.services.js";

export const getAllNews = async (req, res, next) => {
  try {
    const news = await getAllNewsAdminService();
    return res.status(200).json({
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
    const news = await getNewsContentAdminService(Number(id));
    if (!news) {
      return res.status(404).json({
        success: true,
        message: "Không tìm thấy tin tức này!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lấy tin tức thành công!",
      result: news,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateNewsStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (![0, 1].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ!",
      });
    }
    const news = await updateNewsStatusService(Number(id), status);
    return res.status(200).json({
      success: true,
      message:
        status === 0 ? "Ẩn tin tức thành công!" : "Hiển thị tin tức thành công",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
