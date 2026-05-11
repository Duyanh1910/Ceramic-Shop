import express from "express";
import {
  addNewProductController,
  deleteVariantImage,
  getProductInfo,
  getProducts,
  updateProductController,
  updateProductStatusController,
  updateVariantStatusController,
} from "../../controllers/admin/product/adminProduct.controller.js";

const router = express.Router();
router.post("/", addNewProductController);
router.get("/", getProducts);
router.get("/:id", getProductInfo);
router.put("/:id", updateProductController);
router.delete("/variant/images", deleteVariantImage);
router.patch("/:id/status", updateProductStatusController);
router.patch("/variants/:id/status", updateVariantStatusController);
export default router;
