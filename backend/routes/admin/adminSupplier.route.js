import express from "express";
import checkRole from "../../middlewares/authorize.middlewares.js";
import {
  getSupplierInfo,
  getSuppliers,
  createSupplier,
  updateSupplier,
} from "../../controllers/admin/supplier/supplier.controller.js";

const router = express.Router();
router.get("/", getSuppliers);
router.post("/", checkRole("Admin"), createSupplier);
router.get("/:id", getSupplierInfo);
router.put("/:id", updateSupplier);
export default router;
