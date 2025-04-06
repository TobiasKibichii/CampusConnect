
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



// PATCH /:postId - Update an event/post
router.patch("/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // Attached by verifyToken middleware

    // Find the post by its ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure userId is an ObjectId and compare it
    if (!post.userId.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized to edit this post" });
    }

    // Convert string times to valid Date objects
    const convertToDate = (timeString) => {
      const currentDate = new Date();
      const [hours, minutes] = timeString.split(":").map((num) => parseInt(num, 10));
      currentDate.setHours(hours, minutes, 0, 0); // Set the hours and minutes, resetting other parts of the date
      return currentDate;
    };

    // Define which fields can be updated
    const allowedUpdates = [
      "description",
      "about",
      "whatYoullLearn",
      "eventDate",
      "eventTimeFrom",
      "eventTimeTo",
      "location",
    ];

    // Update the post with the provided fields
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        // For eventTimeFrom and eventTimeTo, convert them to Date objects
        if (field === "eventTimeFrom" || field === "eventTimeTo") {
          post[field] = convertToDate(req.body[field]);
        } else {
          post[field] = req.body[field];
        }
      }
    });

    // Save the updated post
    const updatedPost = await post.save();
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


export default router;
