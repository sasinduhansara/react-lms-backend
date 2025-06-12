import express from "express";
import {
  sendNotification,
  getUserNotifications,
  getSentNotifications,
  replyToNotification,
  markAsRead,
  deleteNotification,
  getNotificationStats,
  getRecipientUsers,
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get user's notifications (inbox)
router.get("/inbox", authenticate, getUserNotifications);

// Get sent notifications
router.get("/sent", authenticate, getSentNotifications);

// Get notification statistics
router.get("/stats", authenticate, getNotificationStats);

// Get users for recipient selection
router.get("/users", authenticate, getRecipientUsers);

// Send notification
router.post("/send", authenticate, sendNotification);

// Reply to notification
router.post("/reply/:notificationId", authenticate, replyToNotification);

// Mark notification as read
router.put("/read/:notificationId", authenticate, markAsRead);

// Delete notification
router.delete("/:notificationId", authenticate, deleteNotification);

export default router;
