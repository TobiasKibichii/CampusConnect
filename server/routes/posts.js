import express from "express";
import {  createPost, getFeedPosts, getUserPosts, likePost, attendEvent, postComments, getPostComments, updateComment, deleteComment, toggleLikeComment} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

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

export default router;
