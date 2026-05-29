import express from "express";
import {
  deleteAllNotifications,
  deleteNotification,
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
router.delete("/", deleteAllNotifications);
router.delete("/:id", deleteNotification);

export default router;
