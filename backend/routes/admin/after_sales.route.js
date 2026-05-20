import express from "express";
import {
  createWarrantyHistory,
  getAllWarranties,
  getWarrantyById,
  replaceWarrantyProduct,
  updateWarrantyStatus,
  exportWarrantyXlsxController,
} from "../../controllers/admin/after_sales/warranty.controller.js";
import { getAllRisks } from "../../controllers/admin/after_sales/risk.controller.js";

const router = express.Router();

router.get("/warranties", getAllWarranties);
router.get("/warranties/export", exportWarrantyXlsxController);
router.get("/warranties/:id", getWarrantyById);
router.post("/warranties/:id/histories", createWarrantyHistory);
router.patch("/warranties/:id/status", updateWarrantyStatus);
router.post("/warranties/:id/replace-product", replaceWarrantyProduct);

router.get("/risks", getAllRisks);

export default router;
