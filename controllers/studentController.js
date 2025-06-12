import User from "../models/user.js";
import Subject from "../models/subject.js";
import Material from "../models/materials.js";
import Lesson from "../models/lesson.js";
import News from "../models/news.js";
import Department from "../models/department.js";

// Get student profile
export const getStudentProfile = async (req, res) => {
  console.log("=== STUDENT PROFILE REQUEST ===");
  try {
    const { userId } = req.params;

    // Verify authorization - student can only access own data, admin can access any
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized. You can only access your own profile.",
      });
    }

    const student = await User.findOne({
      userId: userId,
      role: "student",
    }).select("-passwordHash");

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    console.log("✅ Student profile found:", student.userId);
    res.json(student);
  } catch (err) {
    console.error("❌ Error in getStudentProfile:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch student profile",
    });
  }
};

// Get subjects for student's department
export const getStudentSubjects = async (req, res) => {
  console.log("=== STUDENT SUBJECTS REQUEST ===");
  try {
    const { userId } = req.params;

    // Verify authorization
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // Get student info
    const student = await User.findOne({
      userId: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    console.log("Student department:", student.department);

    // Find department by departmentId (not ObjectId)
    const department = await Department.findOne({
      departmentId: student.department,
    });

    if (!department) {
      console.log("❌ Department not found for:", student.department);
      return res.status(404).json({
        error: "Department not found",
      });
    }

    // Get subjects for student's department using department ObjectId
    const subjects = await Subject.find({
      department: department._id,
    })
      .populate("department", "departmentId name")
      .sort({ year: 1, semester: 1, subjectCode: 1 });

    console.log("✅ Subjects found:", subjects.length);
    res.json(subjects);
  } catch (err) {
    console.error("❌ Error in getStudentSubjects:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch student subjects",
    });
  }
};

// Get lessons available for student
export const getStudentLessons = async (req, res) => {
  console.log("=== STUDENT LESSONS REQUEST ===");
  try {
    const { userId } = req.params;

    // Verify authorization
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // Get student info
    const student = await User.findOne({
      userId: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    // Find department
    const department = await Department.findOne({
      departmentId: student.department,
    });

    if (!department) {
      return res.status(404).json({
        error: "Department not found",
      });
    }

    // Get published lessons for student's department
    const lessons = await Lesson.find({
      department: department._id,
      status: "published",
    })
      .populate("department", "departmentId name")
      .populate("subject", "subjectCode subjectName")
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("✅ Lessons found:", lessons.length);
    res.json(lessons);
  } catch (err) {
    console.error("❌ Error in getStudentLessons:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch student lessons",
    });
  }
};

// Get materials available for student
export const getStudentMaterials = async (req, res) => {
  console.log("=== STUDENT MATERIALS REQUEST ===");
  try {
    const { userId } = req.params;

    // Verify authorization
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // Get student info
    const student = await User.findOne({
      userId: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    // Find department
    const department = await Department.findOne({
      departmentId: student.department,
    });

    if (!department) {
      return res.status(404).json({
        error: "Department not found",
      });
    }

    // Get subjects for student's department
    const subjects = await Subject.find({
      department: department._id,
    });

    const subjectIds = subjects.map((subject) => subject._id);

    // Get materials for those subjects
    const materials = await Material.find({
      subject: { $in: subjectIds },
    })
      .populate("subject", "subjectCode subjectName")
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("✅ Materials found:", materials.length);
    res.json(materials);
  } catch (err) {
    console.error("❌ Error in getStudentMaterials:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch student materials",
    });
  }
};

// Get student dashboard statistics
export const getStudentStats = async (req, res) => {
  console.log("=== STUDENT STATS REQUEST ===");
  try {
    const { userId } = req.params;

    // Verify authorization
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // Get student info
    const student = await User.findOne({
      userId: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    // Get department
    const department = await Department.findOne({
      departmentId: student.department,
    });

    if (!department) {
      return res.status(404).json({
        error: "Department not found",
      });
    }

    // Get subjects for student's department
    const subjects = await Subject.find({
      department: department._id,
    });

    const subjectIds = subjects.map((subject) => subject._id);

    // Calculate statistics
    const [totalSubjects, availableLessons, availableMaterials] =
      await Promise.all([
        Subject.countDocuments({ department: department._id }),
        Lesson.countDocuments({
          department: department._id,
          status: "published",
        }),
        Material.countDocuments({
          subject: { $in: subjectIds },
        }),
      ]);

    const stats = {
      enrolledSubjects: totalSubjects,
      availableLessons: availableLessons,
      totalMaterials: availableMaterials,
      averageGrade: 85, // Placeholder - implement grade system later
    };

    console.log("✅ Stats calculated:", stats);
    res.json(stats);
  } catch (err) {
    console.error("❌ Error in getStudentStats:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch statistics",
    });
  }
};

// Get recent news for student
export const getStudentNews = async (req, res) => {
  console.log("=== STUDENT NEWS REQUEST ===");
  try {
    const { userId } = req.params;

    // Verify authorization
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // Get recent published news
    const news = await News.find({
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("✅ News found:", news.length);
    res.json(news);
  } catch (err) {
    console.error("❌ Error in getStudentNews:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch news",
    });
  }
};
