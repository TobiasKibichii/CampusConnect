import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getNotifications} from "../controllers/notifications.js";
import Notification from "../models/Notification.js";
import GroupMessageNotification from "../models/GroupMessageNotification.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/markAsRead", verifyToken, async (req, res) => {
    console.log("MARK AS READ HIT", req.user);
  try {
    console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
    const userId = req.user.id;
    // Update all notifications for the user that haven't been read
    const result = await Notification.updateMany(
      { userId: userId, read: false },
      { read: true }
    );
    console.log("Notifications marked as read:", result);
    res.status(200).json({ message: "Notifications marked as read", updated: result });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: error.message });
  }
});



// GET unread group notifications
router.get("/groupNotifications", verifyToken, async (req, res) => {
  try {
    console.log("yoloo")
    console.log("yoloo")
    console.log("yoloo")
    const notifications = await GroupMessageNotification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch group notifications" });
  }
});

// MARK all as read
router.put("/groupNotifications/markAsRead", verifyToken, async (req, res) => {
  try {
    console.log("yoloooo")
    console.log("yoloooo")
    console.log("yoloooo")
    await GroupMessageNotification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "All group notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark group notifications as read" });
  }
});


export default router;