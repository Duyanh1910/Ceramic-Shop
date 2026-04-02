import express from "express";
import {
  getAllOrders,
  getOrderDetail,
} from "../../controllers/admin/order/adminOrder.controller.js";

const router = express.Router();
router.get("/", getAllOrders);
router.get("/:orderCode", getAllOrders);

export default router;
