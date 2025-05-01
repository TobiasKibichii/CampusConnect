import express from "express";
import {  createPost, getFeedPosts, getUserPosts, likePost, attendEvent, postComments, getPostComments, updateComment, deleteComment, toggleLikeComment} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import Post from "../models/Post.js";

import mongoose from 'mongoose';


const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets"); // storing in public/assets
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});



const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only the "picture" field
    if (file.fieldname === "picture") {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  },
});



/* READ */
router.get("/",  verifyToken, getFeedPosts);
router.post(
  "/p",
  verifyToken,
  upload.single("picture"),
  async (req, res, next) => {
    console.log("📌 File:", req.file);
    console.log("📌 Body:", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded." });
    }

    try {
      await createPost(req, res);
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ message: "Post creation failed." });
    }
  }
);


router.get("/user/:userId", verifyToken, getUserPosts);

router.patch("/:postId/attend", verifyToken, attendEvent);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

router.post("/:postId/comments", verifyToken, postComments);
router.get("/:postId/comments", getPostComments)

router.patch("/:postId/comments/:commentId", verifyToken, updateComment)
router.delete("/:postId/comments/:commentId", verifyToken, deleteComment)


router.get("/popularEvents", verifyToken, async (req, res) => {
  try {
    const events = await Post.find({ type: "event" })
      .sort({ "likes": -1, createdAt: -1 }) // sort by likes (assuming likes is a map)
      .exec();

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching popular events:", error);
    res.status(500).json({ message: error.message });
  }
});



// DELETE a post by ID
router.delete("/postDelete/:id", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    console.log( postId)
    const deletedPost = await Post.findByIdAndDelete(new mongoose.Types.ObjectId(postId));

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Get a specific post or event with populated venue details
router.get('/venueCapacity/:postId', async (req, res) => {
  try {
    
    const post = await Post.findById(req.params.postId)
      .populate('venueId'); // Populate the venueId field to get venue details

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log("kkkkk" + post)
    console.log("kkkkk" + post)
    console.log("kkkkk" + post)
    console.log("kkkkk" + post)
    // Send post data with populated venue information (like capacity)
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// In routes/posts.js (or events.js)

router.post("/:eventId/attendance", verifyToken, async (req, res) => {
  try {
    const { attendees } = req.body;
    const { eventId } = req.params;
    console.log(attendees, eventId)
    const event = await Post.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.attendanceConfirmed)
      return res
        .status(400)
        .json({ message: "Attendance already confirmed for this event." });

    
    event.presentCount = attendees.length;
    event.attendanceConfirmed = true;

    await event.save();

    res.status(200).json({ message: "Attendance submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// In your posts route (e.g., GET /posts/editor/:editorId)
router.get("/editor/:userId", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({
      userId: req.params.userId,
      type: "event", // ✅ Only events
    }).populate("attendees", "firstName lastName");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
