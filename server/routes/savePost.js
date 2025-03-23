

import express from "express";
import { getSavedPosts,savePost } from "../controllers/savePost.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.get("/", verifyToken, getSavedPosts)
// Endpoint to toggle save on a post
router.patch("/:postId", verifyToken, savePost);

export default router;
