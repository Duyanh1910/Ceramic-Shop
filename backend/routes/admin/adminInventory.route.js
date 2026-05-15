import express from "express";
import {
  ListInventoryHistoryController,
  ShowInventoryHistoryController,
  ExportInventoryHistoryXlsxController,
} from "../../controllers/admin/inventory_history/inventory_history.controller.js";

const router = express.Router();
router.get("/", ListInventoryHistoryController);
router.get("/export", ExportInventoryHistoryXlsxController);
router.get("/:id", ShowInventoryHistoryController);
export default router;
