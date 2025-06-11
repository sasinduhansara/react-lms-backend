import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: String, // userId of sender
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    recipient: {
      type: String, // 'all', 'students', 'lecturers', 'admins', or specific userId
      required: true,
    },
    recipientType: {
      type: String,
      enum: ['all', 'role', 'specific'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['announcement', 'message', 'reply', 'system'],
      default: 'message',
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    parentNotificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      default: null,
    },
    readBy: [{
      userId: String,
      readAt: {
        type: Date,
        default: Date.now,
      }
    }],
    department: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, recipient: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
