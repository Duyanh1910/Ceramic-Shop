import express from "express";
import {
  getMyWarranties,
  getMyWarrantyById,
  requestWarranty,
} from "../controllers/warranty.controller.js";

const router = express.Router();

router.get("/", getMyWarranties);
router.get("/:id", getMyWarrantyById);
router.post("/:id/request", requestWarranty);

export default router;