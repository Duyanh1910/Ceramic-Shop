import express from "express";
import {
  createPayment,
  handleMoMoIpn,
} from "../../controllers/payment/momo.controller.js";

const router = express.Router();
router.post("/momo-create", createPayment);
router.post("/momo-ipn", handleMoMoIpn);

export default router;
