// controllers/editorController.js
import Group from "../models/Group.js";
import { io } from "../index.js";


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

    // Create notification object
    const notification = {
      message: `Your request to join "${group.name}" has been approved.`,
      type: "group-approval",
      createdAt: new Date().toISOString(),
    };

    // Emit socket
    
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
    res.json({ group });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Server error" });
  }
};
