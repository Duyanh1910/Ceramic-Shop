import express from "express";
import {
  getCustomers,
  getCustomerInfo,
} from "../../controllers/admin/customer/adminCustomer.controller.js";

const router = express.Router();
router.get("/", getCustomers);
router.get("/:id", getCustomerInfo);

export default router;
