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


