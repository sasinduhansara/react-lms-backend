import Subject from "../models/subject.js";
import Department from "../models/department.js";
import mongoose from "mongoose";

// Create subject - Admin and Lecturer only
export const createSubject = async (req, res) => {
  try {
    // Check permissions
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Unauthorized. Only admins and lecturers can create subjects.",
      });
    }

    // Validate department
    const department = await Department.findOne({
      departmentId: req.body.departmentId,
    });
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Create subject
    const subject = await Subject.create({
      ...req.body,
      department: department._id,
    });

    // Populate department details
    const populatedSubject = await Subject.findById(subject._id).populate(
      "department",
      "departmentId name"
    );

    res.status(201).json(populatedSubject);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: errors.join(", ") });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: "Subject code already exists" });
    }
    res.status(400).json({ error: err.message });
  }
};

// Get all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const { department, year, semester } = req.query;
    let query = {};

    if (department) {
      const dept = await Department.findOne({ departmentId: department });
      if (!dept) return res.status(404).json({ error: "Department not found" });
      query.department = dept._id;
    }

    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const subjects = await Subject.find(query)
      .populate("department", "departmentId name")
      .sort({ year: 1, semester: 1, subjectCode: 1 });

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get subjects by department
export const getSubjectsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const department = await Department.findOne({ departmentId });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const subjects = await Subject.find({ department: department._id })
      .populate("department", "departmentId name")
      .sort({ year: 1, semester: 1, subjectCode: 1 });

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get subjects by department, year and semester
export const getSubjectsByYearSem = async (req, res) => {
  try {
    const { departmentId, year, semester } = req.params;
    const department = await Department.findOne({ departmentId });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const subjects = await Subject.find({
      department: department._id,
      year: parseInt(year),
      semester: parseInt(semester),
    })
      .populate("department", "departmentId name")
      .sort({ subjectCode: 1 });

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update subject
export const updateSubject = async (req, res) => {
  try {
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Unauthorized. Only admins and lecturers can update subjects.",
      });
    }

    const { subjectCode } = req.params;
    const updateData = { ...req.body };

    if (updateData.departmentId) {
      const department = await Department.findOne({
        departmentId: updateData.departmentId,
      });
      if (!department)
        return res.status(404).json({ error: "Department not found" });
      updateData.department = department._id;
    }

    const subject = await Subject.findOneAndUpdate(
      { subjectCode },
      updateData,
      { new: true, runValidators: true }
    ).populate("department", "departmentId name");

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(subject);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(400).json({ error: err.message });
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Unauthorized. Only admins and lecturers can delete subjects.",
      });
    }

    // FIXED: Accept both _id and subjectCode
    const { id } = req.params; // Changed from subjectCode to id
    let subject;

    // Try to find by ObjectId first, then by subjectCode
    if (mongoose.Types.ObjectId.isValid(id)) {
      subject = await Subject.findByIdAndDelete(id);
    } else {
      subject = await Subject.findOneAndDelete({ subjectCode: id });
    }

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // TODO: Delete associated materials

    res.json({
      message: "Subject deleted successfully",
      deletedSubject: subject,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
