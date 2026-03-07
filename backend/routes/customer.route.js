import express from "express";
import {
  getCustomers,
  getCustomerInfo,
} from "../controllers/customer.controller.js";

const router = express.Router();
router.get("/", getCustomers);
router.get("/:id", getCustomerInfo);
export default router;
