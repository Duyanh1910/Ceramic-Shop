import express from "express";
import {
  getAllNews,
  getNewsContent,
  updateNewsStatus,
  createNews,
} from "../../controllers/admin/news/adminNews.controller.js";

const router = express.Router();
router.get("/", getAllNews);
router.post("/", createNews);
router.get("/:id", getNewsContent);

router.patch("/:id/status", updateNewsStatus);

export default router;
