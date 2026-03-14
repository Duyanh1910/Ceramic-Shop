import express from "express";
import {
  getProducts,
  getProductInfo,
} from "../controllers/product.controller.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/:id", getProductInfo);
export default router;
