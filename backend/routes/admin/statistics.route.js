import ratingProductController from "../../controllers/statistics/rating.controller.js";
import topSellingProducts from "../../controllers/statistics/best_seller.controller.js";
import getTotalRevenue from "../../controllers/statistics/total_revenue.controller.js";
import getMostViewedProducts from "../../controllers/statistics/most_viewed_product.controller.js";

import express from "express";

const router = express.Router();
router.get("/ratings", ratingProductController);
router.get("/best-sellers", topSellingProducts);
router.get("/most-viewed", getMostViewedProducts);
router.get("/total-revenue", getTotalRevenue);
export default router;
