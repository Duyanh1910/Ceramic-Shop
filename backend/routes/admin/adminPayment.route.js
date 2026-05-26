import express from "express";
import {
  confirmRefundTransaction,
  failRefundTransaction,
  getAllPaymentTransactions,
  getPaymentTransactionById,
} from "../../controllers/payment/adminPayment.controller.js";

const router = express.Router();

router.get("/", getAllPaymentTransactions);
router.get("/:id", getPaymentTransactionById);
router.patch("/:id/confirm-refund", confirmRefundTransaction);
router.patch("/:id/fail-refund", failRefundTransaction);

export default router;