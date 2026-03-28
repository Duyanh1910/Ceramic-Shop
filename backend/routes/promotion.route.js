import { getAllPromotionsController } from "../controllers/promotion.controller.js";
import express from "express";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";

const router = express.Router();

router.get("/", getAllPromotionsController);

export default router;
