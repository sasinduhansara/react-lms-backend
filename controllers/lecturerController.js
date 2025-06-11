import Subject from "../models/subject.js";
import User from "../models/user.js";
import Lesson from "../models/lesson.js";

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
    res.status(500).json({
      error: err.message || "Failed to fetch subjects",
    });
  }
};

// Get students enrolled in lecturer's subjects
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
    res.status(500).json({
      error: err.message || "Failed to fetch students",
    });
  }
};

// Get lecturer's materials (mock data for now)
export const getLecturerMaterials = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Get lecturer's subjects first
    const subjects = await Subject.find({ lecturer: lecturerId });

    // Create mock materials based on subjects
    const mockMaterials = subjects.map((subject, index) => ({
      _id: `material_${subject._id}_${index}`,
      name: `${subject.subjectName} - Lecture Notes.pdf`,
      subject: subject._id,
      fileType: "pdf",
      fileSize: 2048000 + index * 500000,
      createdAt: new Date(
        Date.now() - index * 24 * 60 * 60 * 1000
      ).toISOString(),
      fileUrl: "#",
      lecturer: lecturerId,
    }));

    res.json(mockMaterials);
  } catch (err) {
    console.error("Error fetching lecturer materials:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch materials",
    });
  }
};

// Get lecturer's lessons
export const getLecturerLessons = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Find lessons created by this lecturer
    const lessons = await Lesson.find({ author: lecturerId })
      .populate("subject", "subjectCode subjectName")
      .populate("department", "name departmentId")
      .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (err) {
    console.error("Error fetching lecturer lessons:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch lessons",
    });
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

    const lessonsCount = await Lesson.countDocuments({ author: lecturerId });

    // Mock materials count
    const materialsCount = subjectsCount * 2; // 2 materials per subject

    res.json({
      totalSubjects: subjectsCount,
      totalStudents: studentsCount,
      totalMaterials: materialsCount,
      totalLessons: lessonsCount,
    });
  } catch (err) {
    console.error("Error fetching lecturer stats:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch statistics",
    });
  }
};
