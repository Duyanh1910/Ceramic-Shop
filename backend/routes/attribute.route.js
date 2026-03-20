import {
  getAttributeController,
  getAllAttributesController,
} from "../controllers/attribute.controller.js";

import express from "express";

const router = express.Router();

router.get("/", getAllAttributesController);
router.get("/:id", getAttributeController);

export default router;
