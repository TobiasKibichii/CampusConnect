
import express from "express";
import { createEvent } from "../controllers/event.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.post("/", verifyToken, createEvent);


export default router;
