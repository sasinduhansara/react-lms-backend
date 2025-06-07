// userController.js - Full controller with all functions
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//--------------------------- user registration---------------------------

export const registerUser = async (req, res) => {
  const { userId, firstName, lastName, department, email, password, role } =
    req.body;

  try {
    // Check if user already exists
    const existingUserById = await User.findOne({ userId: userId });
    if (existingUserById) {
      return res
        .status(400)
        .json({ message: "User with this ID already exists" });
    }

    const existingUserByEmail = await User.findOne({ email: email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Validate department for non-admin users
    if (role !== "admin" && !department) {
      return res
        .status(400)
        .json({ message: "Department is required for students and lecturers" });
    }

    const passHash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      userId,
      firstName,
      lastName,
      department: role !== "admin" ? department : undefined,
      email,
      passwordHash: passHash,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
};

//--------------------------- user login---------------------------

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user)
      return res.status(400).json({
        message: "User not found",
      });

    const isMatch = bcrypt.compareSync(password, user.passwordHash);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid password" });
    } else {
      const payload = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          department: user.department,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//--------------------------- get all users ---------------------------

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash"); // Exclude passwordHash from response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error: Unable to fetch users" });
  }
};

// Get all Admin users
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin users",
      error: error.message,
    });
  }
};

// Get all Lecturer users
export const getAllLecturers = async (req, res) => {
  try {
    const lecturers = await User.find({ role: "lecturer" }).select("-password");

    res.status(200).json({
      success: true,
      count: lecturers.length,
      data: lecturers,
    });
  } catch (error) {
    console.error("Error fetching lecturer users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lecturer users",
      error: error.message,
    });
  }
};

// Get all Student users
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching student users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student users",
      error: error.message,
    });
  }
};

//--------------------------- get users by department ---------------------------

export const getUsersByDepartment = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized. Only admins can view users.",
      });
    }

    const { department } = req.params;

    // Validate department
    const validDepartments = ["HNDIT", "HNDE", "HNDM", "HNDTHM", "HNDAC"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ message: "Invalid department specified" });
    }

    const users = await User.find({ department: department }).select(
      "-passwordHash"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error(`Error fetching users from ${req.params.department}:`, error);
    res.status(500).json({
      message: `Server error while fetching users from ${req.params.department}`,
    });
  }
};

//--------------------------- get users by role and department ---------------------------

export const getUsersByRoleAndDepartment = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized. Only admins can view users.",
      });
    }

    const { role, department } = req.params;

    // Validate role
    const validRoles = ["lecturer", "student"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role for department filtering" });
    }

    // Validate department
    const validDepartments = ["HNDIT", "HNDE", "HNDM", "HNDTHM", "HNDAC"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ message: "Invalid department specified" });
    }

    const users = await User.find({
      role: role,
      department: department,
    }).select("-passwordHash");

    res.status(200).json(users);
  } catch (error) {
    console.error(
      `Error fetching ${req.params.role} users from ${req.params.department}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Server error while fetching filtered users" });
  }
};

//--------------------------- search users ---------------------------

export const searchUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized. Only admins can search users.",
      });
    }

    const { query, role, department } = req.query;

    let searchCriteria = {};

    // Add text search
    if (query) {
      searchCriteria.$or = [
        { userId: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    // Add role filter
    if (role && role !== "all") {
      searchCriteria.role = role;
    }

    // Add department filter
    if (department && department !== "all") {
      searchCriteria.department = department;
    }

    const users = await User.find(searchCriteria).select("-passwordHash");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error while searching users" });
  }
};

//--------------------------- get user by ID ---------------------------

export const getUserById = async (req, res) => {
  try {
    // Check if the requesting user is authorized
    const requestingUserRole = req.user.role;
    const requestingUserId = req.user.userId;
    const targetUserId = req.params.userId;

    // Allow if admin or requesting own data
    if (requestingUserRole !== "admin" && requestingUserId !== targetUserId) {
      return res.status(403).json({
        message:
          "Unauthorized. You can only view your own data or be an admin.",
      });
    }

    const user = await User.findOne({ userId: targetUserId }).select(
      "-passwordHash"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

//--------------------------- get user statistics ---------------------------

// userController.js - Fixed getUserStats function

export const getUserStats = async (req, res) => {
  try {
    // Get all users from database
    const users = await User.find({});

    // Initialize default stats
    const defaultStats = {
      totalUsers: 0,
      roles: {
        admin: 0,
        student: 0,
        lecturer: 0,
      },
      departments: [],
    };

    // Handle empty users array
    if (!users || users.length === 0) {
      return res.status(200).json(defaultStats);
    }

    // Initialize counters
    const stats = {
      totalUsers: users.length,
      roles: {
        admin: 0,
        student: 0,
        lecturer: 0,
      },
      departments: [],
    };

    // Count users by role with proper null/undefined checks
    users.forEach((user) => {
      // Check if user exists and has a role property
      if (user && user.role && typeof user.role === "string") {
        const role = user.role.toLowerCase().trim();

        // Only count valid roles
        if (stats.roles.hasOwnProperty(role)) {
          stats.roles[role]++;
        }
      }
    });

    // Get unique departments with null/undefined checks
    const uniqueDepartments = [
      ...new Set(
        users
          .filter(
            (user) =>
              user && user.department && typeof user.department === "string"
          )
          .map((user) => user.department.trim())
          .filter((dept) => dept.length > 0) // Remove empty strings
      ),
    ];

    stats.departments = uniqueDepartments;

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching user statistics:", error);

    // Return default stats on error
    res.status(500).json({
      error: "Failed to fetch user statistics",
      message: error.message,
      totalUsers: 0,
      roles: {
        admin: 0,
        student: 0,
        lecturer: 0,
      },
      departments: [],
    });
  }
};

//--------------------------- update user ---------------------------

export const updateUser = async (req, res) => {
  try {
    // Check if the requesting user is authorized (must be admin or the same user)
    const requestingUserRole = req.user.role;
    const requestingUserEmail = req.user.email;
    const targetUserEmail = req.body.currentEmail || req.params.email;

    // Only allow updates if user is updating their own account or is an admin
    if (
      requestingUserRole !== "admin" &&
      requestingUserEmail !== targetUserEmail
    ) {
      return res.status(403).json({
        message:
          "Unauthorized. You can only update your own account or be an admin to update others.",
      });
    }

    // Find the user to update
    const user = await User.findOne({ email: targetUserEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Extract update fields from request body
    const { userId, firstName, lastName, departmentId, email, password, role } =
      req.body;

    // Only allow role updates if the requesting user is an admin
    if (role && requestingUserRole !== "admin") {
      return res.status(403).json({
        message: "Unauthorized. Only admins can update roles.",
      });
    }

    // Update user fields if provided
    if (userId) user.userId = userId;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (departmentId) user.department = departmentId;
    if (email) user.email = email;
    if (password) user.passwordHash = bcrypt.hashSync(password, 10);
    if (role && requestingUserRole === "admin") user.role = role;

    // Save the updated user
    const updatedUser = await user.save();

    // Return success response without sending password hash
    res.status(200).json({
      message: "User updated successfully",
      user: {
        userId: updatedUser.userId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        department: updatedUser.department,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "User update failed",
      error: error.message,
    });
  }
};

//--------------------------- delete user by userId ---------------------------

export const deleteUser = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only admins can delete users.",
      });
    }

    const { userId } = req.params;

    // Validate userId parameter
    if (!userId || userId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    //Find the user to be deleted
    const user = await User.findOne({ userId: userId.trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-deletion
    if (req.user.userId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Store user info for logging/response
    const deletedUserInfo = {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    // Delete the user
    const deleteResult = await User.deleteOne({ userId: userId });

    if (deleteResult.deletedCount === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }

    // Log the deletion (optional - for audit trail)
    console.log(`User deleted by admin ${req.user.userId}:`, {
      deletedUser: deletedUserInfo,
      deletedAt: new Date().toISOString(),
      deletedBy: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser: deletedUserInfo,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
