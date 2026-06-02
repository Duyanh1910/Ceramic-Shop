import express from "express";
import {
  getCustomers,
  getCustomerInfo,
  updateCustomerInfo,
  softDeleteCustomerAccount,
} from "../../controllers/admin/customer/adminCustomer.controller.js";
import checkRole from "../../middlewares/authorize.middlewares.js";

const router = express.Router();
router.get("/", getCustomers);
router.get("/:id", getCustomerInfo);
router.put("/:id", checkRole("Admin"), updateCustomerInfo);
router.delete("/:id", checkRole("Admin"), softDeleteCustomerAccount);

export default router;
