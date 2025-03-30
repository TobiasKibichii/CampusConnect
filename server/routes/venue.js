

import express from "express";
import { getAvailableVenues } from "../controllers/venue.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.get("/", verifyToken, getAvailableVenues);


export default router;
