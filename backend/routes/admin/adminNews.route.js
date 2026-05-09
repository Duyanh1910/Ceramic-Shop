import express from "express";
import {
  getAllNews,
  getNewsContent,
  updateNewsStatus,
} from "../../controllers/admin/news/adminNews.controller.js";

const router = express.Router();
router.get("/", getAllNews);
router.get("/:id", getNewsContent);

router.patch("/:id/status", updateNewsStatus);

export default router;
