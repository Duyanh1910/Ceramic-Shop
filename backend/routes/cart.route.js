import express from "express";
import {
  getCartController,
  addCartItemsController,
  updateCartItemsController,
  deleteCartItemsController,
  deleteCartController,
  getCartSummary,
} from "../controllers/cart.controller.js";

const router = express.Router();
router.get("/", getCartController);
router.post("/summary", getCartSummary);
router.post("/items", addCartItemsController);
router.patch("/items/:id", updateCartItemsController);
router.delete("/items/:id", deleteCartItemsController);
router.delete("/items", deleteCartController);

export default router;
