// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient of notification
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // friend who posted
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
