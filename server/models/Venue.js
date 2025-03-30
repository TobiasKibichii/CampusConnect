// models/Venue.js
import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  available: { type: Boolean, default: true }
});

const Venue = mongoose.model('Venue', VenueSchema);

export default Venue;