import express from "express";
import {
  createPaymentMethodAdmin,
  getAllPaymentMethodsAdmin,
  updatePaymentMethodAdmin,
} from "../../controllers/payment/payment_method.controller.js";

const router = express.Router();

router.get("/", getAllPaymentMethodsAdmin);
router.post("/", createPaymentMethodAdmin);
router.patch("/:id", updatePaymentMethodAdmin);

export default router;
