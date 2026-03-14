import express from "express";
import authRoutes from "./auth.route.js";
import customerRoutes from "./customer.route.js";
import categoryRoutes from "./category.route.js";
import productRoutes from "./product.route.js";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customers", jwtMiddleware, customerRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

export default router;
