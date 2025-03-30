import express from "express";
import { getChats, getMessageNotifications, postChats } from "../controllers/messages.js";
import { verifyToken } from "../middleware/auth.js"; // Adjust path as needed

const router = express.Router();

// GET messages between two users, e.g., /messages?sender=<id>&receiver=<id>
router.get("/", verifyToken, getChats);

// POST a new message
router.post("/", verifyToken, postChats);
router.get("/messageNotifications", verifyToken, getMessageNotifications);

export default router;
