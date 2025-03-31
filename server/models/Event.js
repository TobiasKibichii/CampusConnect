// models/Event.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  requiredCapacity: { type: Number, required: true },
  assignedVenue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  // New fields for event time range:
  eventFrom: { type: Date, required: true },
  eventTo: { type: Date, required: true },
  status: { type: String, default: 'Scheduled' },
  processed: { type: Boolean, default: false } // Optional flag for scheduling logic
});

const Event = mongoose.model('Event', EventSchema);

export default Event;
