// scheduler.js
import cron from "node-cron";
import Post from "./models/Post.js";   // Using Post model because events are stored here
import Venue from "./models/Venue.js"; // Venue model

// This task runs every minute. Adjust the cron pattern as needed.
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log(`Scheduler running at ${now.toLocaleTimeString()}`);

    // Find event posts that have ended and haven't been processed.
    const endedEvents = await Post.find({
      type: "event",
      eventTimeTo: { $lt: now },
      processed: { $ne: true },
      status: "Scheduled" // Only process events that are still scheduled
    });
    
    console.log(`Found ${endedEvents.length} ended event(s).`);

    for (const event of endedEvents) {
      console.log(`Processing event ${event._id}:`);
      console.log(`  eventTimeTo: ${event.eventTimeTo}`);
      console.log(`  venueId: ${event.venueId}`);

      if (event.venueId) {
        const venueUpdateResult = await Venue.findByIdAndUpdate(event.venueId, { available: true });
        console.log(`  Venue ${event.venueId} updated to available:`, venueUpdateResult);
      } else {
        console.log(`  No venueId found for event ${event._id}`);
      }

      // Update the event post: mark status as "Ended" and set processed flag to true.
      event.status = "Ended";
      event.processed = true;
      const updatedEvent = await event.save();
      console.log(`  Event ${event._id} updated: status=${updatedEvent.status}, processed=${updatedEvent.processed}`);
    }
    
    console.log(`Scheduler completed at ${now.toLocaleTimeString()}. Updated ${endedEvents.length} event(s).`);
  } catch (error) {
    console.error("Error updating event statuses and venue availability:", error);
  }
});
