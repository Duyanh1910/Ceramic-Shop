import express from "express";
import {
  createPromotionController,
  getAllPromotionsAdminController,
  getPromotionByIDAdminController,
  updatePromotionController,
  updatePromotionStatusController,
} from "../../controllers/admin/promotions/adminPromotions.controller.js";

const router = express.Router();

router.get("/", getAllPromotionsAdminController);
router.get("/:id", getPromotionByIDAdminController);
router.post("/", createPromotionController);
router.put("/:id", updatePromotionController);
router.patch("/:id/status", updatePromotionStatusController);

export default router;