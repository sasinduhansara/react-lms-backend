// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authenticate = async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // UPDATED: Find user by userId from your userController structure
    const user = await User.findOne({ userId: decoded.userId });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid token - user not found" });
    }

    // UPDATED: Set user info based on your userController login response structure
    req.user = {
      id: user._id,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Admin only middleware
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Self or Admin middleware (for user profile operations)
export const requireSelfOrAdmin = (req, res, next) => {
  const targetUserId = req.params.userId;
  const requestingUserId = req.user.userId;
  const requestingUserRole = req.user.role;

  if (requestingUserRole === "admin" || requestingUserId === targetUserId) {
    next();
  } else {
    return res.status(403).json({
      message: "You can only access your own data or be an admin",
    });
  }
};

// ADDED: Lecturer access middleware
export const requireLecturer = (req, res, next) => {
  if (req.user.role !== "lecturer" && req.user.role !== "admin") {
    return res.status(403).json({
      message: "Lecturer access required",
    });
  }
  next();
};

// ADDED: Student access middleware
export const requireStudent = (req, res, next) => {
  if (req.user.role !== "student" && req.user.role !== "admin") {
    return res.status(403).json({
      message: "Student access required",
    });
  }
  next();
};
