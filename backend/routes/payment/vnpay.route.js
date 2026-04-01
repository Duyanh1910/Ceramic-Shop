import express from "express";
import * as vnpayController from "../../controllers/payment/vnpay.controller.js";

const router = express.Router();

router.post("vnpay/create", vnpayController.createPayment);
router.get("vnpay/return", vnpayController.vnpayReturn);
router.get("vnpay/ipn", vnpayController.vnpayIpn);
router.get("vnpay/check", vnpayController.checkPayment);

export default router;
