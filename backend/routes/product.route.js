import express from "express";
import {
  getProducts,
  getProductInfo,
} from "../controllers/product.controller.js";
import { bcXemSanPham } from "../utils/blockchain.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/:id", getProductInfo);
// GET /api/products/:id/trace  — Xem nguồn gốc sản phẩm
router.get("/:id/trace", async (req, res, next) => {
  try {
    const data = await bcXemSanPham(req.params.id);
    res.json({ success: true, result: data });
  } catch (err) { 
    // Trả về JSON lỗi để Frontend dễ xử lý thay vì sập server
    res.status(500).json({ success: false, message: err.message }); 
  }
});
export default router;
