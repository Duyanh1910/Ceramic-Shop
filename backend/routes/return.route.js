import express from "express";
import {
  cancelReturnRequest,
  createReturnRequest,
  getMyReturnById,
  getMyReturns,
} from "../controllers/return.controller.js";

const router = express.Router();

router.get("/", getMyReturns);
router.get("/:id", getMyReturnById);
router.post("/", createReturnRequest);
router.patch("/:id/cancel", cancelReturnRequest);

export default router;