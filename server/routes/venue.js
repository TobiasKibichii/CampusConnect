

import express from "express";

import { verifyToken } from "../middleware/auth.js";
import { checkBookedVenues } from "../controllers/venue.js";

const router = express.Router();

import Venue from "../models/Venue.js";


router.get("/", verifyToken,async (req, res) => {
  try {
    // Query for venues that are available (assuming available is a boolean field)
    const venues = await Venue.find();
    res.status(200).json({ venues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// GET /venues/:venueId/bookings?date=YYYY-MM-DD
router.get("/:venueId/bookings", verifyToken, checkBookedVenues);




export default router;
