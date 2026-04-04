import express from "express";
import {
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
} from "../../controllers/admin/order/adminOrder.controller.js";

const router = express.Router();
router.get("/", getAllOrders);
router.get("/:orderCode", getOrderDetail);
router.patch("/:orderCode", updateOrderStatus);
export default router;
