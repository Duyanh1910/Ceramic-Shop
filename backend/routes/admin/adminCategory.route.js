import express from "express";
import {
  createCategoryController,
  deleteCategoryController,
  updateCategoryController,
  getCategories,
  getCategoryInfo,
} from "../../controllers/admin/category/adminCategory.controller.js";

const router = express.Router();
router.get("/", getCategories);
router.get("/:id", getCategoryInfo);
router.post("/", createCategoryController);
router.delete("/:id", deleteCategoryController);
router.put("/:id", updateCategoryController);
export default router;
