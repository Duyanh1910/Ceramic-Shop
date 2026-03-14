import express from "express";
import {
  getCategories,
  getCategoryInfo,
} from "../controllers/category.controller.js";

const router = express.Router();
router.get("/", getCategories);
router.get("/:id", getCategoryInfo);
export default router;
