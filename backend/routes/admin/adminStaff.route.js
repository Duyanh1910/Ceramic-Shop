import express from "express";
import {
  getStaffs,
  getStaffInfo,
  createNewStaff,
  updateStaffInfo,
} from "../../controllers/admin/staff/adminStaff.controller.js";

const router = express.Router();
router.get("/", getStaffs);
router.post("/", createNewStaff);

router.get("/:id", getStaffInfo);
router.patch("/:id", updateStaffInfo);
export default router;
