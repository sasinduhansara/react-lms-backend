import Subject from "../models/subject.js";
import User from "../models/user.js";
import Lesson from "../models/lesson.js";
import Material from "../models/materials.js";

// Get lecturer profile
export const getLecturerProfile = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Find lecturer by userId
    const lecturer = await User.findOne({ userId: lecturerId }).select(
      "-passwordHash"
    );

    if (!lecturer) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    res.json(lecturer);
  } catch (err) {
    console.error("Error fetching lecturer profile:", err);
    res.status(500).json({ error: err.message || "Failed to fetch profile" });
  }
};

// Get lecturer's subjects
export const getLecturerSubjects = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Find subjects assigned to this lecturer
    const subjects = await Subject.find({ lecturer: lecturerId })
      .populate("department", "name departmentId")
      .sort({ year: 1, semester: 1 });

    res.json(subjects);
  } catch (err) {
    console.error("Error fetching lecturer subjects:", err);
    res.status(500).json({ error: err.message || "Failed to fetch subjects" });
  }
};

// Get students in lecturer's department
export const getLecturerStudents = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Get lecturer info to find department
    const lecturer = await User.findOne({ userId: lecturerId });
    if (!lecturer) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    // Find students from same department
    const students = await User.find({
      role: "student",
      department: lecturer.department,
    }).select("-passwordHash");

    res.json(students);
  } catch (err) {
    console.error("Error fetching lecturer students:", err);
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

// Get lecturer's materials
export const getLecturerMaterials = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Get lecturer's subjects first
    const subjects = await Subject.find({ lecturer: lecturerId });
    const subjectIds = subjects.map((subject) => subject._id);

    // Get materials for lecturer's subjects
    const materials = await Material.find({
      subject: { $in: subjectIds },
    })
      .populate("subject", "subjectCode subjectName")
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    console.error("Error fetching lecturer materials:", err);
    res.status(500).json({ error: err.message || "Failed to fetch materials" });
  }
};

// Get lecturer's lessons
export const getLecturerLessons = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Get lecturer's subjects first
    const subjects = await Subject.find({ lecturer: lecturerId });
    const subjectIds = subjects.map((subject) => subject._id);

    // Get lessons for lecturer's subjects
    const lessons = await Lesson.find({
      subject: { $in: subjectIds },
    })
      .populate("subject", "subjectCode subjectName")
      .populate("department", "name departmentId")
      .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (err) {
    console.error("Error fetching lecturer lessons:", err);
    res.status(500).json({ error: err.message || "Failed to fetch lessons" });
  }
};

// Get lecturer statistics
export const getLecturerStats = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Get lecturer info
    const lecturer = await User.findOne({ userId: lecturerId });
    if (!lecturer) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    // Get counts for lecturer's data
    const subjectsCount = await Subject.countDocuments({
      lecturer: lecturerId,
    });
    const studentsCount = await User.countDocuments({
      role: "student",
      department: lecturer.department,
    });

    // Get lecturer's subjects for lessons/materials count
    const subjects = await Subject.find({ lecturer: lecturerId });
    const subjectIds = subjects.map((subject) => subject._id);

    const lessonsCount = await Lesson.countDocuments({
      subject: { $in: subjectIds },
    });
    const materialsCount = await Material.countDocuments({
      subject: { $in: subjectIds },
    });

    res.json({
      totalSubjects: subjectsCount,
      totalStudents: studentsCount,
      totalMaterials: materialsCount,
      totalLessons: lessonsCount,
    });
  } catch (err) {
    console.error("Error fetching lecturer stats:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch statistics" });
  }
};

export const getLecturerNotifications = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Get lecturer info
    const lecturer = await User.findOne({ userId: lecturerId });
    if (!lecturer) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    // Create sample notifications based on lecturer data
    const notifications = [
      {
        _id: "notif1",
        title: "Welcome to SLIATE LMS",
        message: `Welcome ${lecturer.firstName}! Your lecturer account is now active.`,
        senderName: "System Admin",
        type: "announcement",
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        _id: "notif2",
        title: "Department Update",
        message: `Important updates for ${lecturer.department} department faculty members.`,
        senderName: "Academic Office",
        type: "message",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: false,
      },
      {
        _id: "notif3",
        title: "System Maintenance",
        message:
          "Scheduled maintenance on Sunday 2:00 AM - 4:00 AM. Plan accordingly.",
        senderName: "IT Department",
        type: "system",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        isRead: true,
      },
    ];

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching lecturer notifications:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch notifications" });
  }
};
