import express from "express";
import {
  getAllWarranties,
  getWarrantyById,
} from "../../controllers/admin/after_sales/warranty.controller.js";

const router = express.Router();
router.get("/warranties/", getAllWarranties);
router.get("/warranties/:id", getWarrantyById);

export default router;
