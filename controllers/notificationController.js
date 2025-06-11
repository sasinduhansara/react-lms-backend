import Notification from "../models/notification.js";
import User from "../models/user.js";

// Send notification
export const sendNotification = async (req, res) => {
  try {
    // Check permissions - admin, lecturer can send
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Unauthorized. Only admins and lecturers can send notifications.",
      });
    }

    const { title, message, recipient, priority, type, department } = req.body;

    // Validate required fields
    if (!title || !message || !recipient) {
      return res.status(400).json({
        error: "Title, message, and recipient are required",
      });
    }

    // Determine recipient type
    let recipientType = "specific";
    if (["all", "students", "lecturers", "admins"].includes(recipient)) {
      recipientType = "role";
    }
    if (recipient === "all") {
      recipientType = "all";
    }

    // Create notification
    const notification = await Notification.create({
      title,
      message,
      sender: req.user.userId,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      recipient,
      recipientType,
      priority: priority || "medium",
      type: type || "message",
      department: department || req.user.department,
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({
      error: err.message || "Failed to send notification",
    });
  }
};

// Get notifications for user (inbox)
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    // Build filter for notifications user should see
    const filter = {
      $or: [
        { recipient: userId }, // Direct messages
        { recipient: "all" }, // All users
        { recipient: userRole }, // Role-based
        {
          recipient: userDepartment,
          recipientType: "role",
        }, // Department-based
      ],
    };

    if (type) {
      filter.type = type;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get notifications
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .populate("parentNotificationId", "title message sender");

    // Mark as delivered if not already
    await Notification.updateMany(
      {
        ...filter,
        status: "sent",
      },
      {
        status: "delivered",
      }
    );

    // Get total count
    const total = await Notification.countDocuments(filter);

    // Check read status for each notification
    const enhancedNotifications = notifications.map((notification) => {
      const isRead = notification.readBy.some((read) => read.userId === userId);
      return {
        ...notification.toObject(),
        isRead,
        isReply: !!notification.parentNotificationId,
      };
    });

    res.json({
      success: true,
      data: enhancedNotifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch notifications",
    });
  }
};

// Get sent notifications
export const getSentNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get sent notifications
    const notifications = await Notification.find({ sender: userId })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .populate("parentNotificationId", "title message recipient");

    const total = await Notification.countDocuments({ sender: userId });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (err) {
    console.error("Error fetching sent notifications:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch sent notifications",
    });
  }
};

// Reply to notification
export const replyToNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Reply message is required",
      });
    }

    // Get original notification
    const originalNotification = await Notification.findById(notificationId);
    if (!originalNotification) {
      return res.status(404).json({
        error: "Original notification not found",
      });
    }

    // Create reply
    const reply = await Notification.create({
      title: `Re: ${originalNotification.title}`,
      message,
      sender: req.user.userId,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      recipient: originalNotification.sender,
      recipientType: "specific",
      priority: "medium",
      type: "reply",
      parentNotificationId: notificationId,
      department: req.user.department,
    });

    res.status(201).json({
      success: true,
      message: "Reply sent successfully",
      data: reply,
    });
  } catch (err) {
    console.error("Error sending reply:", err);
    res.status(500).json({
      error: err.message || "Failed to send reply",
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    // Check if already read by this user
    const alreadyRead = notification.readBy.some(
      (read) => read.userId === userId
    );

    if (!alreadyRead) {
      notification.readBy.push({
        userId,
        readAt: new Date(),
      });

      // Update status to read if it's a direct message
      if (notification.recipient === userId) {
        notification.status = "read";
        notification.isRead = true;
      }

      await notification.save();
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({
      error: err.message || "Failed to mark notification as read",
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    // Check permissions - can delete own sent notifications or received notifications
    if (
      notification.sender !== userId &&
      notification.recipient !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "Unauthorized to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({
      error: err.message || "Failed to delete notification",
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    // Build filter for user's notifications
    const filter = {
      $or: [
        { recipient: userId },
        { recipient: "all" },
        { recipient: userRole },
        {
          recipient: userDepartment,
          recipientType: "role",
        },
      ],
    };

    const totalNotifications = await Notification.countDocuments(filter);

    const unreadNotifications = await Notification.countDocuments({
      ...filter,
      readBy: { $not: { $elemMatch: { userId } } },
    });

    const sentNotifications = await Notification.countDocuments({
      sender: userId,
    });

    res.json({
      success: true,
      data: {
        total: totalNotifications,
        unread: unreadNotifications,
        sent: sentNotifications,
      },
    });
  } catch (err) {
    console.error("Error fetching notification stats:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch notification statistics",
    });
  }
};

// Get users for recipient selection
export const getRecipientUsers = async (req, res) => {
  try {
    // Only admin and lecturers can see user list
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Unauthorized to view users",
      });
    }

    const { role, department } = req.query;

    let filter = {};
    if (role && role !== "all") {
      filter.role = role;
    }
    if (department && department !== "all") {
      filter.department = department;
    }

    const users = await User.find(filter)
      .select("userId firstName lastName email role department")
      .sort({ firstName: 1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch users",
    });
  }
};
