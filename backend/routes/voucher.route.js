import {
  getMyVouchersController,
  saveVouchersController,
} from "../controllers/voucher_wallet.controller.js";
import express from "express";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";

const router = express.Router();

router.get("/me", jwtMiddleware, getMyVouchersController);
router.post("/save-voucher", jwtMiddleware, saveVouchersController);

export default router;
