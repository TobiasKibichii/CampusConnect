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

import MessageNotification from "./models/MessageNotification.js";


// Import the Messenger model for direct messages
import Messenger from "./models/Messenger.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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
app.use('/venues', venueRoutes );
app.use('/events', eventRoutes );
app.use('/messageNotifications', messageNotificationsRoutes );



// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Change this to your frontend URL if needed
    methods: ["GET", "POST"],
  },
});

// Save the io instance in app so that it is accessible in controllers if needed
app.set("io", io);

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // When a client joins, add them to a room based on their userId
  socket.on("join", (userId) => {
    console.log(`Socket ${socket.id} joining room: ${userId}`);
    socket.join(userId);
  });

  // Listen for sendMessage event for real-time messaging
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
  try {
    // Create and save the new message
    const newMessage = new Messenger({
      sender: senderId,
      receiver: receiverId,
      text: text,
    });
    await newMessage.save();

    // Create a notification for the receiver
    const newNotification = new MessageNotification({
      recipient: receiverId,           // The recipient of the message
      sender: senderId,                // The sender of the message
      message: text.slice(0, 50),        // A snippet of the message (e.g., first 50 characters)
      isRead: false,
    });
    await newNotification.save();

    // Emit the message to the receiver's room
    io.to(receiverId).emit("receiveMessage", newMessage);

    // Optionally, also emit the message back to the sender for confirmation
    socket.emit("receiveMessage", newMessage);
  } catch (err) {
    console.error("Error sending message:", err);
  }
});


  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
