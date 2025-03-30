import Venue from "../models/Venue.js";

export const getAvailableVenues = async (req, res) => {
  try {
    // Query for venues that are available (assuming available is a boolean field)
    const venues = await Venue.find({ available: true });
    res.status(200).json({ venues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
