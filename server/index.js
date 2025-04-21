import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { sendEmail } from "./utils/mailer.js";


// Import your routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import userzRoutes from "./routes/userz.js";
import postRoutes from "./routes/posts.js";
import groupRoutes from "./routes/groups.js";
import commentRoutes from "./routes/comments.js";
import groupMessagesRoutes from "./routes/groupMessages.js";
import adminRoutes from "./routes/admin.js";
import editorRoutes from "./routes/editor.js";
import searchRoutes from "./routes/search.js";
import saveRoutes from "./routes/savePost.js";
import notificationsRoutes from "./routes/notifications.js";
import messagesRoutes from "./routes/messages.js";
import venueRoutes from "./routes/venue.js";
import eventRoutes from "./routes/event.js";
import messageNotificationsRoutes from "./routes/messageNotifications.js";
import aiSearchRoutes from "./routes/aiSearch.js";
import recommendationRoutes from "./routes/recommendation.js";
import suggestedGroupsRoutes from "./routes/suggestedGroups.js";
import suggestedFriendsRoutes from "./routes/suggestedFriends.js";
import notesRoutes from "./routes/notes.js";

// Import the Messenger model for direct messages
import Messenger from "./models/Messenger.js";
// Import the Notification model for messaging notifications
import MessageNotification from "./models/MessageNotification.js";
// Import your Post model (which stores both posts and events)
import Post from "./models/Post.js";
// Import your Venue model
import Venue from "./models/Venue.js";

import Message from "./models/Message.js";
import GroupMessageNotification from "./models/GroupMessageNotification.js";
import Group from "./models/Group.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/userz", userzRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/groups", groupRoutes);
app.use("/groupMessages", groupMessagesRoutes);
app.use("/admin", adminRoutes);
app.use("/editor", editorRoutes);
app.use("/search", searchRoutes);
app.use("/save", saveRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/messages", messagesRoutes);
app.use("/venues", venueRoutes);
app.use("/events", eventRoutes);
app.use("/messageNotifications", messageNotificationsRoutes);
app.use("/api", aiSearchRoutes);
app.use("/recommendations",recommendationRoutes)
app.use("/suggestedGroups", suggestedGroupsRoutes);
app.use("/suggestedFriends", suggestedFriendsRoutes);
app.use("/notes", notesRoutes);


// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Change this to your frontend URL if needed
    methods: ["GET", "POST"],
  },
});

// Save the io instance in app so it is accessible in controllers if needed
app.set("io", io);

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // When a client joins, add them to a room based on their userId.
  socket.on("join", (userId) => {
    console.log(`Socket ${socket.id} joining room: ${userId}`);
    socket.join(userId);
  });

  // Listen for sendMessage event for real-time messaging.
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      // Create and save the new message.
      const newMessage = new Messenger({
        sender: senderId,
        receiver: receiverId,
        text: text,
      });
      await newMessage.save();

      // Create a notification for the receiver.
      const newNotification = new MessageNotification({
        recipient: receiverId, // The recipient of the message.
        sender: senderId,      // The sender of the message.
        message: text.slice(0, 50), // A snippet of the message.
        isRead: false,
      });
      await newNotification.save();

      // Emit the message to the receiver's room.
      io.to(receiverId).emit("receiveMessage", newMessage);
      // Optionally, also emit the message back to the sender for confirmation.
      socket.emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });



  

socket.on("sendGroupMessage", async ({ senderId, groupId, text }) => {
  try {
    // Save the group message
    const newMessage = new Message({
      sender: senderId,
      groupId,
      text,
    });
    console.log(newMessage)
    await newMessage.save();

    // Get all members of the group (excluding sender)
    const group = await Group.findById(groupId).populate("members");
    const recipients = group.members.filter(m => m._id.toString() !== senderId);


    console.log("kkkkkkk")
    console.log("kkkkkkk")
    // Save a notification for each recipient

    const notifications = recipients.map(member => ({
      recipient: member._id,
      groupId,
      sender: senderId,
      message: text.slice(0, 50),
      isRead: false,
    }));
    console.log("📩 Notifications to insert:", notifications);

    await GroupMessageNotification.insertMany(notifications);

    // Emit to all group members (except sender)
    recipients.forEach(member => {
      io.to(member._id.toString()).emit("receiveGroupMessage", {
        groupId,
        message: newMessage,
      });
    });

    // Emit back to sender for confirmation
    socket.emit("receiveGroupMessage", {
      groupId,
      message: newMessage,
    });

  } catch (err) {
    console.error("Error sending group message:", err);
  }
});






  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// -----------------------
// Scheduler to update venue availability when an event ends
// -----------------------

// This scheduler uses the Post model (since events are stored there).
// It finds event posts that have ended (i.e. eventTimeTo < now), haven't been processed,
// and have a status of "Scheduled". It then updates the associated venue to available,
// sets the event status to "Ended", and marks it as processed.
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log(`Scheduler running at ${now.toLocaleTimeString()}`);

    // Find event posts (stored in Post) that have ended.
    const endedEvents = await Post.find({
      type: "event",
      eventTimeTo: { $lt: now },
      processed: { $ne: true },
      status: "Scheduled"
    });

    console.log(`Found ${endedEvents.length} ended event(s).`);

    for (const event of endedEvents) {
      console.log(`Processing event ${event._id}: eventTo=${event.eventTo}, venueId=${event.venueId}`);
      // Update the associated venue to mark it as available.
      if (event.venueId) {
        const updatedVenue = await Venue.findByIdAndUpdate(event.venueId, { available: true });
        console.log(`Venue ${event.venueId} updated to available:`, updatedVenue);
      } else {
        console.log(`Event ${event._id} has no venueId.`);
      }
      // Update the event post.
      event.status = "Ended";
      event.processed = true;
      const updatedEvent = await event.save();
      console.log(`Event ${event._id} updated: status=${updatedEvent.status}, processed=${updatedEvent.processed}`);
    }
    
    console.log(`Scheduler completed at ${now.toLocaleTimeString()}: Updated ${endedEvents.length} event(s).`);
  } catch (error) {
    console.error("Error updating event statuses and venue availability:", error);
  }
});

// -----------------------
// End Scheduler
// -----------------------

// Add to routes or directly in your main server file

import User from "./models/User.js";

app.get("/test-email",  async (req, res) => {
  try {
    const testUserId = new mongoose.Types.ObjectId("67f2ac615cfdcb59a0d6350a");

    const testUser = await User.findById(testUserId);

    if (!testUser || !testUser.email) {
      return res.status(404).send("Test user not found or has no email");
    }

    const emailBody = `
      <h3>Hello ${testUser.firstName} 👋,</h3>
      <p>This is a test reminder email from <strong>Campus Connect</strong>.</p>
      <p>If you're seeing this, your mail system works perfectly! ✅</p>
      <br/>
      <p>Best,<br/>Campus Connect Team</p>
    `;

    await sendEmail("kibichiitoby314@gmail.com", "📅 Test Email from CampusConnect", emailBody);

    res.send("✅ Test email sent to you successfully!");
  } catch (err) {
    console.error("❌ Error sending test email:", err);
    res.status(500).send("Failed to send test email.");
  }
});



cron.schedule("08 12 * * *", async () => {
  try {
    console.log("Running daily event notification job...");

    // Define today's start and end boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Query for events scheduled for today (adjust the query if needed)
    const events = await Post.find({
      type: "event",
      eventDate: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    console.log(`Found ${events.length} event(s) scheduled for today`);

    // Loop through each event
    for (const event of events) {
      // Only proceed if there are registered attendees
      if (event.attendees && event.attendees.length > 0) {
        for (const attendeeId of event.attendees) {
          // Fetch the attendee's email from the User model
          const user = await User.findById(attendeeId).lean();
          if (user && user.email) {
            // Customize the email subject and body as needed
            const subject = `Reminder: ${event.description} is happening today!`;
            const html = `
              <p>Hi ${user.firstName},</p>
              <p>This is a reminder that the event <strong>${event.description}</strong> is scheduled for today at ${event.location}.</p>
              <p>Please check your event details and be on time.</p>
              <p>Thank you,</p>
              <p>Your App Team</p>
            `;
            await sendEmail(user.email, subject, html);
            console.log(`Email sent to ${user.email} for event ${event._id}`);
          } else {
            console.warn(`No email found for attendee: ${attendeeId}`);
          }
        }
      }
    }
    console.log("Daily event notification job completed.");
  } catch (error) {
    console.error("Error in daily event notification job:", error);
  }
});



export { io };

const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
