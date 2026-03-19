import express from "express";
import authRoutes from "./auth.route.js";
import adminCustomerRoutes from "./admin/adminCustomer.route.js";
import adminStaffRoutes from "./admin/adminStaff.route.js";
import customerRoutes from "../routes/customer.route.js";
import staffRoutes from "../routes/staff.route.js";
import categoryRoutes from "./category.route.js";
import productRoutes from "./product.route.js";
import jwtMiddleware from "../middlewares/jwt.middlewares.js";
import checkRole from "../middlewares/authorize.middlewares.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/customers/", customerRoutes);
router.use("/staffs/", staffRoutes);

router.use(
  "/admin/customers",
  jwtMiddleware,
  checkRole("Staff", "Admin"),
  adminCustomerRoutes,
);

router.use(
  "/admin/staffs",
  jwtMiddleware,
  checkRole("Admin"),
  adminStaffRoutes,
);

router.use("/categories", categoryRoutes);

router.use("/products", productRoutes);

export default router;
