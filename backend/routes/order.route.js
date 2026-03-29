import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderInfo,
  cancelOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:orderCode", getOrderInfo);
router.put("/:orderCode/cancel", cancelOrder);

export default router;
