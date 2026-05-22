import express from "express";
import authRoutes from "./auth.route.js";
import adminCustomerRoutes from "./admin/adminCustomer.route.js";
import adminStaffRoutes from "./admin/adminStaff.route.js";
import adminProductRoutes from "./admin/adminProduct.route.js";
import adminOrderRoutes from "./admin/adminOrder.route.js";
import adminNewsRoutes from "./admin/adminNews.route.js";
import adminInventoryRoutes from "./admin/adminInventory.route.js";
import adminReviewsRoutes from "./admin/adminProductReviews.route.js";

import customerRoutes from "../routes/customer.route.js";
import staffRoutes from "../routes/staff.route.js";
import categoryRoutes from "./category.route.js";
import attributeRoutes from "./attribute.route.js";
import productRoutes from "./product.route.js";
import cartRoutes from "./cart.route.js";
import chatbotRoutes from "./chatbot.route.js";
import voucherRoutes from "./voucher.route.js";
import promotionRoutes from "./promotion.route.js";
import orderRoutes from "./order.route.js";
import ratingRoutes from "./rating.route.js";
import vnpayRoutes from "./payment/vnpay.route.js";
import momoRoutes from "./payment/momo.route.js";
import newsRoutes from "./news.route.js";
import warrantyRoutes from "./warranty.route.js";
import returnRoutes from "./return.route.js";

import statisticsRoutes from "./admin/statistics.route.js";
import afterSalesRoutes from "./admin/after_sales.route.js";
import adminPromotionRoutes from "./admin/adminPromotions.route.js";
import adminCategoryRoutes from "./admin/adminCategory.route.js";

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

router.use(
  "/admin/categories",
  jwtMiddleware,
  checkRole("Staff", "Admin"),
  adminCategoryRoutes,
);

router.use(
  "/admin/reviews",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  adminReviewsRoutes,
);

router.use(
  "/admin/news",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  adminNewsRoutes,
);

router.use(
  "/admin/inventories",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  adminInventoryRoutes,
);

router.use(
  "/admin/products",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  adminProductRoutes,
);

router.use(
  "/admin/orders",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  adminOrderRoutes,
);

router.use("/warranties", jwtMiddleware, checkRole("Customer"), warrantyRoutes);

router.use("/returns", jwtMiddleware, checkRole("Customer"), returnRoutes);

router.use(
  "/admin/statistics",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  statisticsRoutes,
);

router.use(
  "/admin/after_sales",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  afterSalesRoutes,
);

router.use(
  "/admin/promotions",
  jwtMiddleware,
  checkRole("Admin", "Staff"),
  adminPromotionRoutes,
);

router.use("/categories", categoryRoutes);

router.use("/attributes", attributeRoutes);

router.use("/cart", jwtMiddleware, cartRoutes);

router.use("/products", productRoutes);

router.use("/chatbot", chatbotRoutes);

router.use("/vouchers", voucherRoutes);

router.use("/promotions", promotionRoutes);

router.use("/orders", jwtMiddleware, orderRoutes);

router.use("/reviews", ratingRoutes);

router.use("/payment", momoRoutes);

router.use("/news", newsRoutes);

export default router;
