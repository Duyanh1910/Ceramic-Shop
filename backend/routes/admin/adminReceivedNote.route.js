import express from "express";
import {
  cancelReceivedNote,
  completeReceivedNote,
  createReceivedNote,
  getAllReceivedNotes,
  getReceivedNoteInfo,
  updateReceivedNote
} from "../../controllers/admin/supplier/received_note.controller.js";

const router = express.Router();
router.get("/", getAllReceivedNotes);
router.post("/", createReceivedNote);
router.get("/:id", getReceivedNoteInfo);
router.patch("/:id", updateReceivedNote);
router.patch("/:id/complete", completeReceivedNote);
router.patch("/:id/cancel", cancelReceivedNote);
export default router;
