import express from "express";
import { getFeedPosts, getUserPosts, likePost, attendEvent, postComments, getPostComments, updateComment, deleteComment, toggleLikeComment } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/",  getFeedPosts);
router.get("/user/:userId", verifyToken, getUserPosts);

router.patch("/:postId/attend", verifyToken, attendEvent);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

router.post("/:postId/comments", verifyToken, postComments);
router.get("/:postId/comments", getPostComments)

router.patch("/:postId/comments/:commentId", verifyToken, updateComment)
router.delete("/:postId/comments/:commentId", verifyToken, deleteComment)




export default router;
