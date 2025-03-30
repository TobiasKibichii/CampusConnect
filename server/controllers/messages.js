import Message from "../models/Messenger.js";
import MessageNotification from "../models/MessageNotification.js"; // Make sure you have created a Notification model

export const getChats = async (req, res) => {
  try {
    const { sender, receiver } = req.query;
    if (!sender || !receiver) {
      return res.status(400).json({ message: "Both sender and receiver IDs are required." });
    }
    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 }); // Sort ascending (oldest first)
    
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const postChats = async (req, res) => {
  try {
    console.log(req.body)
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "senderId, receiverId, and message text are required." });
    }
    // Create and save the new message
    const newMessage = new Message({ sender: senderId, receiver: receiverId, message });
    await newMessage.save();

    // Create a notification for the receiver
    const newNotification = new MessageNotification({
      recipient: receiverId,           // The user receiving the message
      sender: senderId,                // The user who sent the message
      message: message.slice(0, 50),     // A snippet of the message for preview
      isRead: false,
    });
    console.log(newNotification)
    await newNotification.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





export const getMessageNotifications = async (req, res) => {
  try {
    const notifications = await MessageNotification.find({
      recipient: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName picturePath");
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
