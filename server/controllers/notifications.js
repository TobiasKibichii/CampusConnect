import Notification from "../models/Notification.js"

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("friendId", "firstName lastName picturePath")
      .populate("postId", "description picturePath");
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
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
};
