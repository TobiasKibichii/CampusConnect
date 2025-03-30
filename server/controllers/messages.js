import Message from "../models/Messenger.js";

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
}


export const postChats = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "senderId, receiverId, and message text are required." });
    }
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}