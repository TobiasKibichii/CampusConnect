import MessageNotifications from "../models/MessageNotification.js";

export const getMessageNotifications = async (req, res) => {
  try {
    const notifications = await MessageNotifications.find({
      recipient: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName picturePath");
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};