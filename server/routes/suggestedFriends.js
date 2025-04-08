import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Get the current user's record.
    const currentUser = await User.findById(userId).lean();
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Find candidate users:
    // Exclude the current user and anyone already in the current user's friend list.
    const candidates = await User.find({
      _id: { $ne: userId, $nin: currentUser.friends || [] },
    }).lean();

    // Score each candidate based on mutual friends.
    const scoredCandidates = candidates.map(candidate => {
      // Ensure friend lists are arrays of strings.
      const candidateFriends = (candidate.friends || []).map(id => id.toString());
      const currentFriends = (currentUser.friends || []).map(id => id.toString());
      // Count mutual friends.
      const mutualCount = candidateFriends.filter(friendId => currentFriends.includes(friendId)).length;
      return { candidate, mutualCount };
    });

    // Sort descending by mutual friend count.
    scoredCandidates.sort((a, b) => b.mutualCount - a.mutualCount);
    console.log("heyyyyyyy")
    console.log("heyyyyyyy")
    console.log("heyyyyyyy")
    console.log("heyyyyyyy")
    console.log("heyyyyyyy")
    console.log( scoredCandidates.slice(0, 5))
    // Optionally, return only the top 5 suggestions.
    res.json({ suggestedFriends: scoredCandidates.slice(0, 5) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
