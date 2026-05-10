import {
  getAllNewsAdminService,
  getNewsContentAdminService,
  updateNewsStatusService,
  createNewsService,
} from "../../../services/news.services.js";
import sanitizeHtml from "sanitize-html";
import { isValidUrl } from "../../../utils/helpers.js";
import ErrorHandler from "../../../utils/error_handler.js";
const allowedTags = [
  "p",
  "h1",
  "h2",
  "h3",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "img",
  "a",
  "code",
  "pre",
];
const allowedAttributes = {
  a: ["href"],
  img: ["src", "alt"],
};
const baseImage =
  "https://res.cloudinary.com/dcmwz0uis/image/upload/v1774029061/Screenshot_2026-03-20_093855_h7t2yi.png";
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
        success: false,
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

export const createNews = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { title, content, imageUrl, status } = req.body;
    const formattedContent = sanitizeHtml(content, {
      allowedTags: allowedTags,
      allowedAttributes: allowedAttributes,
    });
    if (imageUrl && !isValidUrl(imageUrl)) {
      return next(new ErrorHandler("URL không hợp lệ!", 422));
    }
    const news = await createNewsService(
      Number(id),
      title,
      formattedContent,
      imageUrl ?? baseImage,
      status || 1,
    );
    return res.status(200).json({
      success: true,
      message: "Tạo tin tức thành công!",
      result: news,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
