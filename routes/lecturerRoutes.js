import express from "express";
import {
  getLecturerProfile,
  getLecturerSubjects,
  getLecturerStudents,
  getLecturerMaterials,
  getLecturerLessons,
  getLecturerStats,
  getLecturerNotifications,
} from "../controllers/lecturerController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get lecturer profile
router.get("/profile/:lecturerId", authenticate, getLecturerProfile);

// Get lecturer's subjects
router.get("/subjects/:lecturerId", authenticate, getLecturerSubjects);

// Get lecturer's students
router.get("/students/:lecturerId", authenticate, getLecturerStudents);

// Get lecturer's materials
router.get("/materials/:lecturerId", authenticate, getLecturerMaterials);

// Get lecturer's lessons
router.get("/lessons/:lecturerId", authenticate, getLecturerLessons);

// Get lecturer statistics
router.get("/stats/:lecturerId", authenticate, getLecturerStats);

// Get lecturer notifications
router.get(
  "/notifications/:lecturerId",
  authenticate,
  getLecturerNotifications
);

export default router;
