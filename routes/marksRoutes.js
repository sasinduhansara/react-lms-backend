import express from "express";
import {
  createOrUpdateMarks,
  getAllMarks,
  getMarksByStudent,
  getMarksBySubject,
  deleteMarks,
  getMarksStatistics,
} from "../controllers/marksController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all marks with filtering
router.get("/", authenticate, getAllMarks);

// Get marks statistics
router.get("/statistics", authenticate, getMarksStatistics);

// Get marks by student ID
router.get("/student/:studentId", authenticate, getMarksByStudent);

// Get marks by subject ID
router.get("/subject/:subjectId", authenticate, getMarksBySubject);

// Create or update marks - Admin and Lecturer only
router.post("/", authenticate, createOrUpdateMarks);

// Delete marks - Admin and Lecturer only
router.delete("/:id", authenticate, deleteMarks);

export default router;
