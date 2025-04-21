import Group from "../models/Group.js";
import Message from "../models/Message.js";
import GroupMessageNotification from "../models/GroupMessageNotification.js";

// GET /groups/:groupId
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate("members", "firstName lastName");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json({ group });
  } catch (error) {
    console.error("Group details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /groups/:groupId/messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    // Find messages for the group, sorted by creation time (oldest first)
    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName picturePath");
    res.json({ messages });
    
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /groups/:groupId/messages
export const postGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Save message
    const message = new Message({
      group: groupId,
      sender: req.user.id,
      text,
    });
    await message.save();
    await message.populate("sender", "firstName lastName");

    // Get group members (excluding sender)
    const group = await Group.findById(groupId).populate("members");
    const recipients = group.members.filter(
      (member) => member._id.toString() !== req.user.id
    );

    // Create notifications
    const notifications = recipients.map((member) => ({
      recipient: member._id,
      groupId,
      sender: req.user.id,
      message: text.slice(0, 50),
      isRead: false,
    }));

    // Save notifications
    await GroupMessageNotification.insertMany(notifications);

    res.status(201).json({ message });
  } catch (error) {
    console.error("Post message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
