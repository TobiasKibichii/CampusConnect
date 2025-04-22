// controllers/editorController.js
import Group from "../models/Group.js";
import { io } from "../index.js";
import Notification from "../models/Notification.js";


// GET: Retrieve the group that the editor owns (including members and join requests)
export const getGroup = async (req, res) => {
  try {
    console.log(req.user.id)
    const group = await Group.findOne({ createdBy: req.user.id })
      .populate("members", "firstName lastName email")
      .populate("joinRequests", "firstName lastName email");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json({ group });
    console.log(group)
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH: Update group details (e.g., name or description)
export const updateGroup = async (req, res) => {
  try {
    const updatedData = req.body;
    const group = await Group.findOneAndUpdate(
      { createdBy: req.user.id },
      updatedData,
      { new: true, runValidators: true }
    );
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json({ group });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// POST: Approve a join request – remove the user from joinRequests and add to members
export const approveJoinRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📥 Approving join request for user: ${userId}`);

    const group = await Group.findOne({ createdBy: req.user.id });
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }

    console.log(`✅ Found group: ${group.name}`);

    // Remove from joinRequests
    group.joinRequests = group.joinRequests.filter(
      (reqUserId) => reqUserId.toString() !== userId
    );
    console.log("🔁 Removed user from joinRequests");

    // Add to members
    if (!group.members.some((memberId) => memberId.toString() === userId)) {
      group.members.push(userId);
      console.log("👥 Added user to group members");
    }

    await group.save();
    console.log("💾 Group updated");

    // Create notification object for the user whose request was approved
    const notification = {
      recipient: userId,  // The user whose request was approved
      groupId: group._id,  // The group where the request was approved
      sender: req.user.id,  // The admin or editor who approved the request
      message: `Your request to join "${group.name}" has been approved.`,
      read: false,  // Initially unread
      createdAt: new Date().toISOString(),
    };

    // Save notification to the database
    await Notification.create(notification);
    console.log("💬 Notification saved");

    // Emit socket notification (optional)
    io.to(userId).emit("groupJoinApproved", notification);
    console.log(`📡 Emitted socket notification to user: ${userId}`);

    res.json({ group });
  } catch (error) {
    console.error("🔥 Error approving join request:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// POST: Reject a join request – simply remove the user from joinRequests
export const rejectJoinRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findOne({ createdBy: req.user.id });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    group.joinRequests = group.joinRequests.filter(
      (reqUserId) => reqUserId.toString() !== userId
    );
    
    await group.save();

    // Create notification object for the user whose request was rejected
    const notification = {
      recipient: userId,  // The user whose request was rejected
      groupId: group._id,  // The group where the request was rejected
      sender: req.user.id,  // The admin or editor who rejected the request
      message: `Your request to join "${group.name}" has been rejected.`,
      read: false,  // Initially unread
      createdAt: new Date().toISOString(),
    };

    // Save notification to the database
    await Notification.create(notification);
    console.log("💬 Notification saved");

    res.json({ group });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE: Remove a member from the group
export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const group = await Group.findOne({ createdBy: req.user.id });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    group.members = group.members.filter(
      (id) => id.toString() !== memberId
    );

    await group.save();

    // Create notification object for the user who was removed
    const notification = {
      recipient: memberId,  // The user who was removed
      groupId: group._id,  // The group from which the user was removed
      sender: req.user.id,  // The admin or editor who removed the member
      message: `You have been removed from the group "${group.name}".`,
      read: false,  // Initially unread
      createdAt: new Date().toISOString(),
    };

    // Save notification to the database
    await Notification.create(notification);
    console.log("💬 Notification saved");

    res.json({ group });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Server error" });
  }
};
