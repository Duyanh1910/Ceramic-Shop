import express from "express";
import {
  reviewsProductController,
  ratingProductController,
  createReviewController,
} from "../controllers/rating.controller.js";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
const router = express.Router();

router.post("/", jwtMiddleware, createReviewController);
router.get("/:id/reviews", reviewsProductController);
router.get("/:id/ratings", ratingProductController);
export default router;
