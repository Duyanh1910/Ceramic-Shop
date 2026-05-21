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
import {
  getAllReturns,
  getReturnById,
  processReturn,
  updateReturnStatus,
} from "../../controllers/admin/after_sales/return.controller.js";

const router = express.Router();

router.get("/warranties", getAllWarranties);
router.get("/warranties/export", exportWarrantyXlsxController);
router.get("/warranties/:id", getWarrantyById);
router.post("/warranties/:id/histories", createWarrantyHistory);
router.patch("/warranties/:id/status", updateWarrantyStatus);
router.post("/warranties/:id/replace-product", replaceWarrantyProduct);

router.get("/returns", getAllReturns);
router.get("/returns/:id", getReturnById);
router.patch("/returns/:id/status", updateReturnStatus);
router.post("/returns/:id/process", processReturn);

router.get("/risks", getAllRisks);

export default router;