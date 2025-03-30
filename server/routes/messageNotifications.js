
import express from "express";
import { } from "../controllers/messageNotifications.js";

import { verifyToken } from "../middleware/auth.js";
import { getMessageNotifications } from "../controllers/messageNotifications.js";

const router = express.Router();


router.get("/", verifyToken, getMessageNotifications);


export default router;
