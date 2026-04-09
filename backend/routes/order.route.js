import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderInfo,
  cancelOrder,
  calculateFee,
  calculateDiscount,
  calculateProductFee,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getMyOrders);

router.post("/calculate-fee", calculateFee);
router.post("/calculate-discount", calculateDiscount);
router.post("/calculate-product", calculateProductFee);

router.get("/:orderCode", getOrderInfo);
router.put("/:orderCode/cancel", cancelOrder);

export default router;
