import express from "express";
import {
  updateCustomerMe,
  sendChangeEmailOtp,
  verifyChangeEmailOtp,
} from "../controllers/customer.controller.js";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import checkRole from "../middlewares/authorize.middlewares.js";
const router = express.Router();

router.patch("/me", jwtMiddleware, checkRole("Customer"), updateCustomerMe);
router.post(
  "/me/email/send-otp",
  jwtMiddleware,
  checkRole("Customer"),
  sendChangeEmailOtp,
);
router.patch(
  "/me/email",
  jwtMiddleware,
  checkRole("Customer"),
  verifyChangeEmailOtp,
);
export default router;
