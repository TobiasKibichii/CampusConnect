import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getNotifications} from "../controllers/notifications.js";
import Notification from "../models/Notification.js";

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

export default router;