import express from "express";
import { updateCustomerMe } from "../controllers/customer.controller.js";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import checkRole from "../middlewares/authorize.middlewares.js";
const router = express.Router();

router.patch("/me", jwtMiddleware, checkRole("Customer"), updateCustomerMe);
export default router;
