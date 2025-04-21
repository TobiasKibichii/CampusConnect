import mongoose from 'mongoose';

const groupMessageNotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: String,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const GroupMessageNotification = mongoose.model("GroupMessageNotification", groupMessageNotificationSchema);
export default GroupMessageNotification;