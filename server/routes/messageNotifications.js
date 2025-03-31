import MessageNotification from "../models/MessageNotification.js";
import express from "express";
import { } from "../controllers/messageNotifications.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.get("/", verifyToken,async (req, res) => {
  try {
    // Only fetch unread notifications
    const notifications = await MessageNotification.find({
      recipient: req.user.id,
      isRead: false,
    }).populate("sender", "firstName lastName picturePath");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
});


router.patch("/markNotificationsRead", verifyToken,  async (req, res) => {
  try {
    const result = await MessageNotification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    console.log("Updated notifications:", result);
    res.status(200).json({ message: "Notifications marked as read", updated: result });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: error.message });
  }
});


export default router;
