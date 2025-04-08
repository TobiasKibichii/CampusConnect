import express from "express";
const router = express.Router();
import User from "../models/User.js";
import Post from "../models/Post.js";
import Group from "../models/Group.js";
import { recommendPostsForUser} from "../utils/recommendationEngine.js";
import { verifyToken } from "../middleware/auth.js";


router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user data.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Fetch liked posts.
    const likedPosts = await Post.find({ [`likes.${userId}`]: { $exists: true } });
    
    // Fetch saved posts (already referenced in the user document).
    const savedPosts = await Post.find({ _id: { $in: user.savedPosts } });
    
    // Fetch groups that the user is part of.
    const groups = await Group.find({ members: userId });
    
    // Build the aggregated user text from:
    // - The user's bio.
    // - Liked posts (title + description).
    // - Saved posts (title + description).
    // - Groups (name + description).
    let aggregateText = user.bio || "";
    
    likedPosts.forEach(post => {
      aggregateText += ` ${post.title} ${post.description}`;
    });
    
    savedPosts.forEach(post => {
      aggregateText += ` ${post.title} ${post.description}`;
    });
    
    groups.forEach(group => {
      aggregateText += ` ${group.name} ${group.description}`;
    });
    
    // Fetch candidate posts: all posts excluding those the user has liked or saved.
    const likedPostIds = likedPosts.map(post => post._id);
    const savedPostIds = user.savedPosts;
    const excludedIds = [...likedPostIds, ...savedPostIds];
    const candidatePosts = await Post.find({ _id: { $nin: excludedIds } });
    
    // Run the recommendation engine.
    const recommendations = recommendPostsForUser(aggregateText, candidatePosts, 5);
    
    // Respond with the recommendations.
    res.json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
