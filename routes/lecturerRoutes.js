import express from "express";
import {
  getLecturerSubjects,
  getLecturerStudents,
  getLecturerMaterials,
  getLecturerLessons,
  getLecturerStats,
} from "../controllers/lecturerController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

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

export default router;
