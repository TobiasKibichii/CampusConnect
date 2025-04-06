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

// Import the Messenger model for direct messages
import Messenger from "./models/Messenger.js";
// Import the Notification model for messaging notifications
import MessageNotification from "./models/MessageNotification.js";
// Import your Post model (which stores both posts and events)
import Post from "./models/Post.js";
// Import your Venue model
import Venue from "./models/Venue.js";

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

  // -----------------------
  // Emitter for group join requests.
  // When a client wants to request joining a group, they emit "sendGroupJoinRequest"
  // with details including requesterId, adminId (or room id to notify), groupId, etc.
  socket.on("sendGroupJoinRequest", (request) => {
    console.log(
      `Received group join request from ${request.requesterId} for group ${request.groupId} targeting admin ${request.adminId}`
    );
    // Emit the group join request event to the admin's room.
    io.to(request.adminId).emit("groupJoinRequest", request);
  });
  // -----------------------

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

export { io };

const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
