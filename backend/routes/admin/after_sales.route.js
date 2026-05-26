import express from "express";
import {
  createWarrantyHistory,
  getAllWarranties,
  getWarrantyById,
  replaceWarrantyProduct,
  updateWarrantyStatus,
  exportWarrantyXlsxController,
} from "../../controllers/admin/after_sales/warranty.controller.js";
import {
  createRisk,
  getAllRisks,
  getRiskById,
  updateRisk,
  updateRiskStatus,
} from "../../controllers/admin/after_sales/risk.controller.js";
import {
  confirmReturnRefund,
  getAllReturns,
  getReturnById,
  getReturnVariantOptions,
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
router.get("/returns/variants", getReturnVariantOptions);
router.get("/returns/:id", getReturnById);
router.patch("/returns/:id/status", updateReturnStatus);
router.post("/returns/:id/process", processReturn);
router.patch("/returns/:id/confirm-refund", confirmReturnRefund);

router.get("/risks", getAllRisks);
router.post("/risks", createRisk);
router.get("/risks/:id", getRiskById);
router.patch("/risks/:id", updateRisk);
router.patch("/risks/:id/status", updateRiskStatus);

export default router;