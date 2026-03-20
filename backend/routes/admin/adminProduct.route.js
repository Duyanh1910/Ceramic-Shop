import express from "express";
import { addNewProductController } from "../../controllers/admin/product/adminProduct.controller.js";

const router = express.Router();
router.post("/", addNewProductController);
//router.post("/:id", getCustomerInfo);

export default router;
