import express from "express";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import {
  login,
  customerRegister,
  getMe,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", customerRegister);
router.post("/me", jwtMiddleware, getMe);
export default router;
