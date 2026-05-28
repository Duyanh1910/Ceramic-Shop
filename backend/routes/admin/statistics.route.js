import ratingProductController from "../../controllers/statistics/rating.controller.js";
import topSellingProducts from "../../controllers/statistics/best_seller.controller.js";
import getTotalRevenue, {
  exportRevenueXlsxController,
} from "../../controllers/statistics/total_revenue.controller.js";
import getMostViewedProducts, {
  exportMostViewedProductsXlsxController,
} from "../../controllers/statistics/most_viewed_product.controller.js";
import { getOverviewStats } from "../../controllers/statistics/overview.controller.js";

import express from "express";

const router = express.Router();
router.get("/ratings", ratingProductController);
router.get("/best-sellers", topSellingProducts);
router.get("/most-viewed/export", exportMostViewedProductsXlsxController);
router.get("/most-viewed", getMostViewedProducts);
router.get("/total-revenue/export", exportRevenueXlsxController);
router.get("/total-revenue", getTotalRevenue);
router.post("/overview", getOverviewStats);
export default router;
