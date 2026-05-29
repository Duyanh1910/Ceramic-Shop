import express from "express";
import {
  getProducts,
  getProductInfo,
} from "../controllers/product.controller.js";
import { bcXemSanPham } from "../utils/blockchain.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id/trace", async (req, res) => {
  try {
    const data = await bcXemSanPham(req.params.id);
    return res.json({ success: true, result: data });
  } catch (err) {
    return res.status(404).json({
      success: false,
      message: err.message || "Không thể truy xuất nguồn gốc sản phẩm!",
    });
  }
});

router.get("/:id", getProductInfo);

export default router;