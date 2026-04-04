import express from "express";
import {
  createZaloPayPayment,
  zaloPayCallback,
} from "../../controllers/payment/zalopay.controller.js";

const router = express.Router();
router.post("/zalo-create", createZaloPayPayment);
router.post("/zalo-ipn", zaloPayCallback);

export default router;
