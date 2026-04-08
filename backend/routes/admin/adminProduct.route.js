import express from "express";
import {
  addNewProductController,
  deleteVariantImage,
} from "../../controllers/admin/product/adminProduct.controller.js";

const router = express.Router();
router.post("/", addNewProductController);
router.delete("/variant/image", deleteVariantImage);


export default router;
