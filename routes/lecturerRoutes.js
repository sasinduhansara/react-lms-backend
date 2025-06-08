import express from "express";
import {
  getLecturerSubjects,
  getLecturerStudents,
  getLecturerMaterials,
  getLecturerLessons,
  getLecturerStats,
} from "../controllers/lecturerController.js";
import { authenticate, requireLecturer } from "../middleware/auth.js";

const router = express.Router();

// Get lecturer's subjects
router.get(
  "/subjects/:lecturerId",
  authenticate,
  requireLecturer,
  getLecturerSubjects
);

// Get students enrolled in lecturer's subjects
router.get(
  "/students/:lecturerId",
  authenticate,
  requireLecturer,
  getLecturerStudents
);

// Get lecturer's materials
router.get(
  "/materials/:lecturerId",
  authenticate,
  requireLecturer,
  getLecturerMaterials
);

// Get lecturer's lessons
router.get(
  "/lessons/:lecturerId",
  authenticate,
  requireLecturer,
  getLecturerLessons
);

// Get lecturer statistics
router.get(
  "/stats/:lecturerId",
  authenticate,
  requireLecturer,
  getLecturerStats
);

export default router;
