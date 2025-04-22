// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // recipient of the notification (user being notified)
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },  // group where the action took place
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },    // sender of the notification (admin/editor)
  message: { type: String, required: true },  // content of the notification
  read: { type: Boolean, default: false },  // track if the notification is read
  createdAt: { type: Date, default: Date.now },  // timestamp of the notification
});

export default mongoose.model("Notification", notificationSchema);
