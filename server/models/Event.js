// models/Event.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  requiredCapacity: { type: Number, required: true },
  assignedVenue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  status: { type: String, default: 'Scheduled' }
});

const Event = mongoose.model('Event', EventSchema);

export default Event;
