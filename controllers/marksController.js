import Mark from "../models/marks.js";
import User from "../models/user.js";
import Subject from "../models/subject.js";
import Department from "../models/department.js";

// Create or update marks
export const createOrUpdateMarks = async (req, res) => {
  try {
    // Check permissions - only admin and lecturers can add marks
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Unauthorized. Only admins and lecturers can manage marks.",
      });
    }

    const {
      studentId,
      departmentId,
      subjectId,
      assignmentMarks,
      examMarks,
      semester,
      year,
      academicYear,
      remarks,
    } = req.body;

    // Validate required fields
    if (
      !studentId ||
      !departmentId ||
      !subjectId ||
      assignmentMarks === undefined ||
      examMarks === undefined ||
      !semester ||
      !year
    ) {
      return res.status(400).json({
        error: "All required fields must be provided",
      });
    }

    // Validate marks range
    if (
      assignmentMarks < 0 ||
      assignmentMarks > 100 ||
      examMarks < 0 ||
      examMarks > 100
    ) {
      return res.status(400).json({
        error: "Marks must be between 0 and 100",
      });
    }

    // Check if student exists
    const student = await User.findOne({ userId: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if department exists
    const department = await Department.findOne({ departmentId });
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Check if student belongs to the department
    if (student.department !== departmentId) {
      return res.status(400).json({
        error: "Student does not belong to the selected department",
      });
    }

    const currentAcademicYear =
      academicYear || new Date().getFullYear().toString();

    // Check if marks already exist for this combination
    const existingMark = await Mark.findOne({
      studentId,
      subject: subjectId,
      semester,
      year,
      academicYear: currentAcademicYear,
    });

    let mark;
    if (existingMark) {
      // Update existing marks
      existingMark.assignmentMarks = assignmentMarks;
      existingMark.examMarks = examMarks;
      existingMark.remarks = remarks || "";
      existingMark.addedBy = req.user.userId;

      mark = await existingMark.save();
    } else {
      // Create new marks
      mark = await Mark.create({
        studentId,
        department: department._id,
        departmentId,
        subject: subjectId,
        assignmentMarks,
        examMarks,
        semester,
        year,
        academicYear: currentAcademicYear,
        addedBy: req.user.userId,
        remarks: remarks || "",
      });
    }

    // Populate the response
    const populatedMark = await Mark.findById(mark._id)
      .populate("department", "name departmentId")
      .populate("subject", "subjectCode subjectName")
      .populate({
        path: "studentId",
        select: "userId firstName lastName email",
        match: { userId: studentId },
      });

    res.status(201).json({
      success: true,
      message: existingMark
        ? "Marks updated successfully"
        : "Marks added successfully",
      data: populatedMark,
    });
  } catch (err) {
    console.error("Error creating/updating marks:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Marks already exist for this student-subject combination",
      });
    }
    res.status(500).json({
      error: err.message || "Failed to save marks",
    });
  }
};

// Get all marks with filtering
export const getAllMarks = async (req, res) => {
  try {
    const {
      studentId,
      departmentId,
      subjectId,
      semester,
      year,
      academicYear,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter object
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (departmentId) {
      const department = await Department.findOne({ departmentId });
      if (department) filter.department = department._id;
    }
    if (subjectId) filter.subject = subjectId;
    if (semester) filter.semester = parseInt(semester);
    if (year) filter.year = parseInt(year);
    if (academicYear) filter.academicYear = academicYear;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get marks with population
    const marks = await Mark.find(filter)
      .populate("department", "name departmentId")
      .populate("subject", "subjectCode subjectName credits")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Get total count for pagination
    const total = await Mark.countDocuments(filter);

    // Enhance marks with student info
    const enhancedMarks = await Promise.all(
      marks.map(async (mark) => {
        const student = await User.findOne({ userId: mark.studentId }).select(
          "userId firstName lastName email department"
        );

        return {
          ...mark.toObject(),
          studentInfo: student,
        };
      })
    );

    res.json({
      success: true,
      data: enhancedMarks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (err) {
    console.error("Error fetching marks:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch marks",
    });
  }
};

// Get marks by student ID
export const getMarksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester, year } = req.query;

    // Check if student exists
    const student = await User.findOne({ userId: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Build filter
    const filter = { studentId };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = parseInt(semester);
    if (year) filter.year = parseInt(year);

    const marks = await Mark.find(filter)
      .populate("department", "name departmentId")
      .populate("subject", "subjectCode subjectName credits")
      .sort({ year: 1, semester: 1, createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalSubjects: marks.length,
      averageMarks:
        marks.length > 0
          ? (
              marks.reduce((sum, mark) => sum + mark.totalMarks, 0) /
              marks.length
            ).toFixed(2)
          : 0,
      highestMarks:
        marks.length > 0
          ? Math.max(...marks.map((mark) => mark.totalMarks))
          : 0,
      lowestMarks:
        marks.length > 0
          ? Math.min(...marks.map((mark) => mark.totalMarks))
          : 0,
      gradeDistribution: marks.reduce((acc, mark) => {
        acc[mark.grade] = (acc[mark.grade] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      data: {
        student: {
          userId: student.userId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          department: student.department,
        },
        marks,
        statistics: stats,
      },
    });
  } catch (err) {
    console.error("Error fetching student marks:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch student marks",
    });
  }
};

// Get marks by subject
export const getMarksBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { academicYear, semester, year } = req.query;

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Build filter
    const filter = { subject: subjectId };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = parseInt(semester);
    if (year) filter.year = parseInt(year);

    const marks = await Mark.find(filter)
      .populate("department", "name departmentId")
      .populate("subject", "subjectCode subjectName credits")
      .sort({ totalMarks: -1 });

    // Enhance with student info
    const enhancedMarks = await Promise.all(
      marks.map(async (mark) => {
        const student = await User.findOne({ userId: mark.studentId }).select(
          "userId firstName lastName email"
        );

        return {
          ...mark.toObject(),
          studentInfo: student,
        };
      })
    );

    // Calculate subject statistics
    const stats = {
      totalStudents: marks.length,
      averageMarks:
        marks.length > 0
          ? (
              marks.reduce((sum, mark) => sum + mark.totalMarks, 0) /
              marks.length
            ).toFixed(2)
          : 0,
      highestMarks:
        marks.length > 0
          ? Math.max(...marks.map((mark) => mark.totalMarks))
          : 0,
      lowestMarks:
        marks.length > 0
          ? Math.min(...marks.map((mark) => mark.totalMarks))
          : 0,
      passRate:
        marks.length > 0
          ? (
              (marks.filter((mark) => mark.totalMarks >= 100).length /
                marks.length) *
              100
            ).toFixed(2)
          : 0,
      gradeDistribution: marks.reduce((acc, mark) => {
        acc[mark.grade] = (acc[mark.grade] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      data: {
        subject: {
          _id: subject._id,
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          credits: subject.credits,
        },
        marks: enhancedMarks,
        statistics: stats,
      },
    });
  } catch (err) {
    console.error("Error fetching subject marks:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch subject marks",
    });
  }
};

// Delete marks
export const deleteMarks = async (req, res) => {
  try {
    // Check permissions
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Unauthorized. Only admins and lecturers can delete marks.",
      });
    }

    const { id } = req.params;

    const mark = await Mark.findByIdAndDelete(id);
    if (!mark) {
      return res.status(404).json({ error: "Marks not found" });
    }

    res.json({
      success: true,
      message: "Marks deleted successfully",
      deletedMark: {
        id: mark._id,
        studentId: mark.studentId,
        subject: mark.subject,
      },
    });
  } catch (err) {
    console.error("Error deleting marks:", err);
    res.status(500).json({
      error: err.message || "Failed to delete marks",
    });
  }
};

// Get marks statistics for dashboard
export const getMarksStatistics = async (req, res) => {
  try {
    const { departmentId, academicYear } = req.query;

    // Build filter
    const filter = {};
    if (departmentId) {
      const department = await Department.findOne({ departmentId });
      if (department) filter.department = department._id;
    }
    if (academicYear) filter.academicYear = academicYear;

    const marks = await Mark.find(filter);

    // Calculate comprehensive statistics
    const stats = {
      totalMarksRecords: marks.length,
      totalStudents: [...new Set(marks.map((mark) => mark.studentId))].length,
      totalSubjects: [...new Set(marks.map((mark) => mark.subject.toString()))]
        .length,
      averageMarks:
        marks.length > 0
          ? (
              marks.reduce((sum, mark) => sum + mark.totalMarks, 0) /
              marks.length
            ).toFixed(2)
          : 0,
      passRate:
        marks.length > 0
          ? (
              (marks.filter((mark) => mark.totalMarks >= 100).length /
                marks.length) *
              100
            ).toFixed(2)
          : 0,
      gradeDistribution: marks.reduce((acc, mark) => {
        acc[mark.grade] = (acc[mark.grade] || 0) + 1;
        return acc;
      }, {}),
      departmentWiseStats: {},
      subjectWiseStats: {},
    };

    // Department-wise statistics
    const departmentGroups = marks.reduce((acc, mark) => {
      const deptId = mark.departmentId;
      if (!acc[deptId]) acc[deptId] = [];
      acc[deptId].push(mark);
      return acc;
    }, {});

    for (const [deptId, deptMarks] of Object.entries(departmentGroups)) {
      stats.departmentWiseStats[deptId] = {
        totalRecords: deptMarks.length,
        averageMarks: (
          deptMarks.reduce((sum, mark) => sum + mark.totalMarks, 0) /
          deptMarks.length
        ).toFixed(2),
        passRate: (
          (deptMarks.filter((mark) => mark.totalMarks >= 100).length /
            deptMarks.length) *
          100
        ).toFixed(2),
      };
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("Error fetching marks statistics:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch marks statistics",
    });
  }
};
