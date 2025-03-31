

import express from "express";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

import Venue from "../models/Venue.js";


router.get("/", verifyToken,async (req, res) => {
  try {
    // Query for venues that are available (assuming available is a boolean field)
    const venues = await Venue.find({ available: true });
    res.status(200).json({ venues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/", verifyToken,  async (venueId, status) => {
  try {
    const updatedVenue = await Venue.findByIdAndUpdate(
      venueId,
      { available: status },
      { new: true } // returns the updated document
    );
    return updatedVenue;
  } catch (error) {
    console.error("Error updating venue status:", error);
    throw error;
  }
});

export default router;
