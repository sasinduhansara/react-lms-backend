import LessonPart from "../models/lessonPart.js";

// Create lesson part
export const createLessonPart = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can create lesson parts.",
      });
    }

    const {
      lessonId,
      partNumber,
      title,
      filePath,
      fileUrl,
      fileType,
      fileSize,
      questions,
      isLocked,
    } = req.body;

    if (!lessonId || !partNumber || !title || !filePath || !fileUrl) {
      return res.status(400).json({
        error:
          "LessonId, partNumber, title, filePath, and fileUrl are required",
      });
    }

    const lessonPart = await LessonPart.create({
      lessonId,
      partNumber,
      title,
      filePath,
      fileUrl,
      fileType,
      fileSize,
      questions: questions || [],
      isLocked: isLocked !== undefined ? isLocked : partNumber > 1,
    });

    res.status(201).json({
      success: true,
      message: "Lesson part created successfully",
      data: lessonPart,
    });
  } catch (err) {
    console.error("Error creating lesson part:", err);
    res.status(400).json({
      error: err.message || "Failed to create lesson part",
    });
  }
};

// Get lesson parts
export const getLessonParts = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const parts = await LessonPart.find({ lessonId }).sort({ partNumber: 1 });

    res.json({
      success: true,
      data: parts,
    });
  } catch (err) {
    console.error("Error fetching lesson parts:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch lesson parts",
    });
  }
};

// Update lesson part
export const updateLessonPart = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can update lesson parts.",
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const lessonPart = await LessonPart.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lessonPart) {
      return res.status(404).json({
        error: "Lesson part not found",
      });
    }

    res.json({
      success: true,
      message: "Lesson part updated successfully",
      data: lessonPart,
    });
  } catch (err) {
    console.error("Error updating lesson part:", err);
    res.status(400).json({
      error: err.message || "Failed to update lesson part",
    });
  }
};

// Delete lesson part
export const deleteLessonPart = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can delete lesson parts.",
      });
    }

    const { id } = req.params;

    const lessonPart = await LessonPart.findByIdAndDelete(id);

    if (!lessonPart) {
      return res.status(404).json({
        error: "Lesson part not found",
      });
    }

    res.json({
      success: true,
      message: "Lesson part deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting lesson part:", err);
    res.status(500).json({
      error: err.message || "Failed to delete lesson part",
    });
  }
};
