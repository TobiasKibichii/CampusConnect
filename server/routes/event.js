
import express from "express";
import { createEvent } from "../controllers/event.js";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();



router.get("/getRegisteredEvents", verifyToken, async (req, res) => {
  console.log("📥 getRegisteredEvents controller triggered"); // <== ADD THIS

  try {
    const userId = req.user.id;
    console.log("👤 Fetching events for user:", userId);

    const events = await Post.find({
      type: "event",
      attendees: userId,
    }).sort({ eventDate: 1 });

    console.log("📦 Events found:", events.length);
    res.status(200).json(events);
  } catch (error) {
    console.log("❌ Error block hit");
    console.error("Error fetching registered events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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
