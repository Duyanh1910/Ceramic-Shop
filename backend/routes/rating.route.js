import express from "express";
import {
  reviewsProductController,
  ratingProductController,
} from "../controllers/rating.controller.js";
const router = express.Router();

router.get("/:id/reviews", reviewsProductController);
router.get("/:id/ratings", ratingProductController);
export default router;
