import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName picturePath")
      .populate("groupId", "name");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Failed to fetch notifications:", err);
    res.status(500).json({ message: err.message });
  }
};
