import express from "express";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../controllers/admin/notification/notification.controller.js";

const router = express.Router();

router.get("/", getNotifications);
router.get("/unread-count", getUnreadNotificationsCount);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:id/read", markNotificationAsRead);

export default router;
