import express from "express";
import {
  getAllWarranties,
  getWarrantyById,
} from "../../controllers/admin/after_sales/warranty.controller.js";
import {
  getAllRisks,
  //getWarrantyById,
} from "../../controllers/admin/after_sales/risk.controller.js";

const router = express.Router();
router.get("/risks/", getAllRisks);
//router.get("/risks/:id", getWarrantyById);

export default router;
