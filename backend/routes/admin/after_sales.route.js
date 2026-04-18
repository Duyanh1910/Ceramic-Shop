import express from "express";
import { getAllWarranties } from "../../controllers/admin/after_sales/warranty.controller.js";

const router = express.Router();
router.get("/warranties/", getAllWarranties);
//router.get("/:id", getCustomerInfo);

export default router;
