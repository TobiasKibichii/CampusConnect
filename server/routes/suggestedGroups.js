import express from "express";
import Group from "../models/Group.js"; // Ensure this model exists
import User from "../models/User.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Fetch the current user's details.
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find groups where the user is not a member.
    const groups = await Group.find({ members: { $nin: [userId] } }).lean();

    // Score each group based on how many of the user's friends are members.
    const scoredGroups = groups.map(group => {
      // Ensure group.members and user.friends are arrays of strings.
      const groupMembers = group.members.map(m => m.toString());
      const userFriends = (user.friends || []).map(f => f.toString());

      // Count common elements (mutual friends in the group)
      const mutualCount = groupMembers.filter(memberId => userFriends.includes(memberId)).length;
      return { group, mutualCount };
    });

    // Sort groups by the mutual friend count, descending.
    scoredGroups.sort((a, b) => b.mutualCount - a.mutualCount);

    // Optionally, return only the top N groups (for example, top 5).
    res.json({ suggestedGroups: scoredGroups.slice(0, 5) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
