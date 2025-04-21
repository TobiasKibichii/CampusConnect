import mongoose from "mongoose";

const MessageNotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MessageNotification = mongoose.model("MessageNotification", MessageNotificationSchema);
export default MessageNotification ;
