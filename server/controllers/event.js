import Event from "../models/Event.js";
import Post from "../models/Post.js";
import Venue from "../models/Venue.js";

export const createEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, requiredCapacity } = req.body;

    // Find an available venue that meets the required capacity, sorted by capacity
    const venue = await Venue.findOne({
      available: true,
      capacity: { $gte: requiredCapacity }
    }).sort({ capacity: 1 }).session(session);

    if (!venue) {
      throw new Error("No available venue meets the requirements.");
    }

    // Create the event with the found venue
    const event = await Event.create([{
      title,
      requiredCapacity,
      assignedVenue: venue._id,
      status: 'Scheduled'
    }], { session });

    // Mark the venue as no longer available
    venue.available = false;
    await venue.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Event created and venue assigned successfully", event: event[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};



