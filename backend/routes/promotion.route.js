import express from "express";
import {
  getAllPromotionsController,
  adminGetAllPromotions,
  adminCreatePromotion,
  adminUpdatePromotion,
  adminDeletePromotion,
  adminToggleStatus,
} from "../controllers/promotion.controller.js";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import adminMiddleware from "../middlewares/admin.middlewares.js";

const router = express.Router();

router.get("/", getAllPromotionsController);

router.get("/admin", jwtMiddleware, adminMiddleware, adminGetAllPromotions);
router.post("/admin", jwtMiddleware, adminMiddleware, adminCreatePromotion);
router.put("/admin/:id", jwtMiddleware, adminMiddleware, adminUpdatePromotion);
router.delete("/admin/:id", jwtMiddleware, adminMiddleware, adminDeletePromotion);
router.patch("/admin/:id/status", jwtMiddleware, adminMiddleware, adminToggleStatus);

export default router;