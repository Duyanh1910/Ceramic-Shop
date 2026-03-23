import express from "express";
import {
  getCartController,
  addCartItemsController,
} from "../controllers/cart.controller.js";

const router = express.Router();
router.get("/", getCartController);
router.post("/items", addCartItemsController);
export default router;
