import express from "express";
import {
  createPayment,
  handleMoMoIpn,
} from "../../controllers/payment/momo.controller.js";
import {
  createZaloPayPayment,
  zaloPayCallback,
} from "../../controllers/payment/zalopay.controller.js";
import { getAllPaymentMethods } from "../../controllers/payment/payment_method.controller.js";
const router = express.Router();

router.get("/", getAllPaymentMethods);
router.post("/zalo-create", createZaloPayPayment);
router.post("/zalo-ipn", zaloPayCallback);

router.post("/momo-create", createPayment);
router.post("/momo-ipn", handleMoMoIpn);

export default router;
