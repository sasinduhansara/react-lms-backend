import Settings from "../models/settings.js";
import User from "../models/user.js";
import Department from "../models/department.js";
import Subject from "../models/subject.js";
import Lesson from "../models/lesson.js";
import News from "../models/news.js";

// Get system settings
export const getSettings = async (req, res) => {
  try {
    // Only admin can access settings
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can access settings.",
      });
    }

    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        lastUpdatedBy: req.user.userId,
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch settings",
    });
  }
};

// Update system settings
export const updateSettings = async (req, res) => {
  try {
    // Only admin can update settings
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can update settings.",
      });
    }

    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.userId,
    };

    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create(updateData);
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate({}, updateData, {
        new: true,
        runValidators: true,
      });
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({
      error: err.message || "Failed to update settings",
    });
  }
};

// Get system statistics for admin dashboard
export const getSystemStats = async (req, res) => {
  try {
    // Only admin can access system stats
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can access system statistics.",
      });
    }

    // Get comprehensive system statistics
    const [
      totalUsers,
      totalStudents,
      totalLecturers,
      totalAdmins,
      totalDepartments,
      totalSubjects,
      totalLessons,
      totalNews,
      recentUsers,
      recentLessons,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "lecturer" }),
      User.countDocuments({ role: "admin" }),
      Department.countDocuments(),
      Subject.countDocuments(),
      Lesson.countDocuments(),
      News.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("-passwordHash"),
      Lesson.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("subject", "subjectCode subjectName"),
    ]);

    // Department-wise statistics
    const departments = await Department.find();
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const [studentCount, lecturerCount, subjectCount] = await Promise.all([
          User.countDocuments({
            role: "student",
            department: dept.departmentId,
          }),
          User.countDocuments({
            role: "lecturer",
            department: dept.departmentId,
          }),
          Subject.countDocuments({ departmentId: dept.departmentId }),
        ]);

        return {
          department: dept.name,
          departmentId: dept.departmentId,
          students: studentCount,
          lecturers: lecturerCount,
          subjects: subjectCount,
        };
      })
    );

    // Monthly user registration stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalLecturers,
          totalAdmins,
          totalDepartments,
          totalSubjects,
          totalLessons,
          totalNews,
        },
        departmentStats,
        monthlyRegistrations: monthlyStats,
        recentActivity: {
          recentUsers,
          recentLessons,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching system stats:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch system statistics",
    });
  }
};

// System maintenance operations
export const performMaintenance = async (req, res) => {
  try {
    // Only admin can perform maintenance
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can perform maintenance operations.",
      });
    }

    const { operation } = req.body;

    switch (operation) {
      case "cleanup_logs":
        // Simulate log cleanup
        await new Promise((resolve) => setTimeout(resolve, 2000));
        break;

      case "optimize_database":
        // Simulate database optimization
        await new Promise((resolve) => setTimeout(resolve, 3000));
        break;

      case "clear_cache":
        // Simulate cache clearing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        break;

      case "backup_database":
        // Simulate database backup
        await new Promise((resolve) => setTimeout(resolve, 5000));
        break;

      default:
        return res.status(400).json({
          error: "Invalid maintenance operation",
        });
    }

    res.json({
      success: true,
      message: `${operation.replace("_", " ")} completed successfully`,
    });
  } catch (err) {
    console.error("Error performing maintenance:", err);
    res.status(500).json({
      error: err.message || "Failed to perform maintenance operation",
    });
  }
};

// Reset system data (dangerous operation)
export const resetSystemData = async (req, res) => {
  try {
    // Only admin can reset system data
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can reset system data.",
      });
    }

    const { confirmationCode, dataType } = req.body;

    // Require confirmation code for safety
    if (confirmationCode !== "RESET_CONFIRM_2024") {
      return res.status(400).json({
        error: "Invalid confirmation code",
      });
    }

    let deletedCount = 0;

    switch (dataType) {
      case "lessons":
        deletedCount = await Lesson.deleteMany({});
        break;

      case "news":
        deletedCount = await News.deleteMany({});
        break;

      case "students":
        deletedCount = await User.deleteMany({ role: "student" });
        break;

      default:
        return res.status(400).json({
          error: "Invalid data type for reset",
        });
    }

    res.json({
      success: true,
      message: `${dataType} data reset completed`,
      deletedCount: deletedCount.deletedCount || 0,
    });
  } catch (err) {
    console.error("Error resetting system data:", err);
    res.status(500).json({
      error: err.message || "Failed to reset system data",
    });
  }
};

// Export system data
export const exportSystemData = async (req, res) => {
  try {
    // Only admin can export data
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can export system data.",
      });
    }

    const { dataType } = req.query;

    let data = {};

    switch (dataType) {
      case "users":
        data.users = await User.find().select("-passwordHash");
        break;

      case "departments":
        data.departments = await Department.find();
        break;

      case "subjects":
        data.subjects = await Subject.find().populate(
          "department",
          "name departmentId"
        );
        break;

      case "lessons":
        data.lessons = await Lesson.find()
          .populate("department", "name departmentId")
          .populate("subject", "subjectCode subjectName");
        break;

      case "all":
        data.users = await User.find().select("-passwordHash");
        data.departments = await Department.find();
        data.subjects = await Subject.find().populate(
          "department",
          "name departmentId"
        );
        data.lessons = await Lesson.find()
          .populate("department", "name departmentId")
          .populate("subject", "subjectCode subjectName");
        data.news = await News.find();
        break;

      default:
        return res.status(400).json({
          error: "Invalid data type for export",
        });
    }

    res.json({
      success: true,
      data,
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.userId,
    });
  } catch (err) {
    console.error("Error exporting data:", err);
    res.status(500).json({
      error: err.message || "Failed to export data",
    });
  }
};
