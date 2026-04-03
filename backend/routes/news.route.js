import { getAllNews, getNewsContent } from "../controllers/news.controller.js";
import express from "express";

const router = express.Router();

router.get("/", getAllNews);
router.get("/:id", getNewsContent);

export default router;
