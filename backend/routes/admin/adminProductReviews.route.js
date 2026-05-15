import express from "express";
import {
  adminGetAllReviews,
  exportCustomerFeedbackXlsx,
} from "../../controllers/admin/reviews/adminReviews.controller.js";

const router = express.Router();
router.get("/", adminGetAllReviews);
router.get("/export", exportCustomerFeedbackXlsx);
export default router;
