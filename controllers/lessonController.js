import Lesson from "../models/lesson.js";
import LessonPart from "../models/lessonPart.js";

// Create lesson
export const createLesson = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can create lessons.",
      });
    }

    const { title, description, department, subject, totalParts, type } =
      req.body;

    if (!title || !department || !subject || !totalParts || !type) {
      return res.status(400).json({
        error: "Title, department, subject, totalParts, and type are required",
      });
    }

    const lessonData = {
      title,
      description,
      department,
      subject,
      totalParts,
      type,
      author: req.user.firstName + " " + req.user.lastName || "Admin",
    };

    const lesson = await Lesson.create(lessonData);
    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (err) {
    console.error("Error creating lesson:", err);
    res.status(400).json({
      error: err.message || "Failed to create lesson",
    });
  }
};

// Get all lessons
export const getAllLessons = async (req, res) => {
  try {
    const { department, subject, status } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (subject) filter.subject = subject;
    if (status) filter.status = status;

    const lessons = await Lesson.find(filter)
      .populate("department", "name departmentId")
      .populate("subject", "subjectCode subjectName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lessons,
    });
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch lessons",
    });
  }
};

// Update lesson
export const updateLesson = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can update lessons.",
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const lesson = await Lesson.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    res.json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (err) {
    console.error("Error updating lesson:", err);
    res.status(400).json({
      error: err.message || "Failed to update lesson",
    });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can delete lessons.",
      });
    }

    const { id } = req.params;

    // Delete all lesson parts first
    await LessonPart.deleteMany({ lessonId: id });

    // Delete the lesson
    const lesson = await Lesson.findByIdAndDelete(id);

    if (!lesson) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    res.json({
      success: true,
      message: "Lesson and all its parts deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting lesson:", err);
    res.status(500).json({
      error: err.message || "Failed to delete lesson",
    });
  }
};

// Increment parts count
export const incrementPartsCount = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { $inc: { uploadedParts: 1 } },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    // Update status to published if all parts are uploaded
    if (lesson.uploadedParts >= lesson.totalParts) {
      lesson.status = "published";
      await lesson.save();
    }

    res.json({
      success: true,
      message: "Parts count updated successfully",
      data: lesson,
    });
  } catch (err) {
    console.error("Error updating parts count:", err);
    res.status(500).json({
      error: err.message || "Failed to update parts count",
    });
  }
};
