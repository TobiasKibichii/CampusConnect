import Venue from "../models/Venue.js";
import Post from "../models/Post.js";

export const getAvailableVenues = async (req, res) => {
  try {
    // Query for venues that are available (assuming available is a boolean field)
    const venues = await Venue.find({ available: true });
    res.status(200).json({ venues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const checkBookedVenues = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { date } = req.query; // date in YYYY-MM-DD format

    // Find event posts at this venue on the specified date
    const bookings = await Post.find({
      type: "event",
      venueId: venueId,
      eventDate: date,
    }).select("eventTimeFrom eventTimeTo -_id");

    console.log(bookings)
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: error.message });
  }
}
