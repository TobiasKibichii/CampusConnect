import Group from "../models/Group.js";
import Message from "../models/Message.js";

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

    // Create a new message; assume req.user is populated by verifyToken middleware.
    const message = new Message({
      group: groupId,
      sender: req.user.id, // or req.user._id if that's what you use
      text,
    });
    await message.save();

    // Optionally populate sender details before sending the response.
    await message.populate("sender", "firstName lastName");

    res.status(201).json({ message });
  } catch (error) {
    console.error("Post message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
