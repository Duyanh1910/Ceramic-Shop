import { ratingProductController } from "../../controllers/statistics/rating.controller.js";
import express from "express";

const router = express.Router();
router.get("/ratings", ratingProductController);

export default router;
