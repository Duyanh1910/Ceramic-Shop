import express from "express";
import { login, customerRegister } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", customerRegister);
export default router;
