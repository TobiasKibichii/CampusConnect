import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getNotifications, markAsRead } from "../controllers/notifications.js";
const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/markAsRead", verifyToken, markAsRead);

export default router;