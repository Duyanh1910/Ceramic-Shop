import express from "express";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import { webhookController } from "../controllers/chatbot/chatbot.controller.js";

const router = express.Router();

router.post("/ask", jwtMiddleware, webhookController);
export default router;
