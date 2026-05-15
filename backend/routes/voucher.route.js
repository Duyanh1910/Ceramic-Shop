import {
  getMyVouchersController,
  saveVouchersController,
  deleteVoucherFromWalletController,
} from "../controllers/voucher_wallet.controller.js";
import express from "express";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";

const router = express.Router();

router.get("/me", jwtMiddleware, getMyVouchersController);
router.post("/save-voucher", jwtMiddleware, saveVouchersController);
router.delete("/:id", jwtMiddleware, deleteVoucherFromWalletController);

export default router;