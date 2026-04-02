import express from "express";
import { getAllOrders } from "../../controllers/admin/order/adminOrder.controller.js";

const router = express.Router();
router.get("/", getAllOrders);

export default router;
