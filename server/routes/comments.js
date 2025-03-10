import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { toggleLikeComment } from "../controllers/posts.js";
const router = express.Router();

router.patch("/:commentId/like", verifyToken, toggleLikeComment);

export default router;