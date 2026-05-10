import express from "express";
import {
  getAllNews,
  getNewsContent,
  updateNewsStatus,
  createNews,
  updateNews,
} from "../../controllers/admin/news/adminNews.controller.js";

const router = express.Router();
router.get("/", getAllNews);
router.post("/", createNews);
router.get("/:id", getNewsContent);

router.patch("/:id/status", updateNewsStatus);
router.patch("/:id/", updateNews);
export default router;
