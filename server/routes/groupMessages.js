import express from "express";
import { getGroupDetails, getGroupMessages, postGroupMessage } from "../controllers/groupMessages.js";
import { verifyToken, isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Get group details (e.g., name, members)
router.get("/:groupId", verifyToken, isAuthenticated, getGroupDetails);

// Get messages for a group
router.get("/:groupId/messages", verifyToken, isAuthenticated, getGroupMessages);

// Post a new message in a group
router.post("/:groupId/messages", verifyToken, isAuthenticated, postGroupMessage);

export default router;
