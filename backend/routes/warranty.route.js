import express from "express";
import { updateStaffMe } from "../controllers/staff.controller.js";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import checkRole from "../middlewares/authorize.middlewares.js";
const router = express.Router();

router.patch("/me", jwtMiddleware, updateStaffMe);
export default router;
