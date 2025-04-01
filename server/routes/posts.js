import express from "express";
import {  createPost, getFeedPosts, getUserPosts, likePost, attendEvent, postComments, getPostComments, updateComment, deleteComment, toggleLikeComment} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import Post from "../models/Post.js";

const upload = multer(); 


const router = express.Router();

/* READ */
router.get("/",  verifyToken, getFeedPosts);
router.post("/p", verifyToken,upload.none(), createPost, (req, res) => {
  console.log("📌 Request Received at /p");
  console.log("📌 Headers:", req.headers);
  console.log("📌 Body:", req.body);
  res.json({ message: "Debugging /p" });
});

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

export default router;
