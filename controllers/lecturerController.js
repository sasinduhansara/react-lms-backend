import Subject from "../models/subject.js";
import User from "../models/user.js";
import Material from "../models/material.js";
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

    // First get lecturer's subjects
    const lecturerSubjects = await Subject.find({ lecturer: lecturerId });
    const subjectIds = lecturerSubjects.map((subject) => subject._id);

    // Find students enrolled in these subjects
    const students = await User.find({
      role: "student",
      subjects: { $in: subjectIds },
    }).populate("subjects", "subjectCode subjectName");

    res.json(students);
  } catch (err) {
    console.error("Error fetching lecturer students:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch students",
    });
  }
};

// Get lecturer's materials
export const getLecturerMaterials = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    // Find materials uploaded by this lecturer
    const materials = await Material.find({ lecturer: lecturerId })
      .populate("subject", "subjectCode subjectName")
      .sort({ createdAt: -1 });

    res.json(materials);
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

    // Get counts for lecturer's data
    const subjectsCount = await Subject.countDocuments({
      lecturer: lecturerId,
    });

    const lecturerSubjects = await Subject.find({ lecturer: lecturerId });
    const subjectIds = lecturerSubjects.map((subject) => subject._id);

    const studentsCount = await User.countDocuments({
      role: "student",
      subjects: { $in: subjectIds },
    });

    const materialsCount = await Material.countDocuments({
      lecturer: lecturerId,
    });
    const lessonsCount = await Lesson.countDocuments({ author: lecturerId });

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
