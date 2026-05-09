import express from "express";
import {
  getStaffs,
  getStaffInfo,
  createNewStaff,
  updateStaffInfo,
  deleteStaff,
} from "../../controllers/admin/staff/adminStaff.controller.js";

const router = express.Router();
router.get("/", getStaffs);
router.post("/", createNewStaff);

router.get("/:id", getStaffInfo);
router.patch("/:id", updateStaffInfo);

router.delete("/:id", deleteStaff);
export default router;
