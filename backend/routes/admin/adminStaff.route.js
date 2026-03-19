import express from "express";
import {
  getStaffs,
  getStaffInfo,
} from "../../controllers/admin/staff/adminStaff.controller.js";

const router = express.Router();
router.get("/", getStaffs);
router.get("/:id", getStaffInfo);

export default router;
