
import express from "express";
import { createEvent } from "../controllers/event.js";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.post("/", verifyToken, createEvent);
router.get("/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
