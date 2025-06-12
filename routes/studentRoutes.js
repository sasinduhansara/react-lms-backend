import express from "express";
import {
  getStudentProfile,
  getStudentSubjects,
  getStudentLessons,
  getStudentMaterials,
  getStudentStats,
  getStudentNews,
} from "../controllers/studentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

console.log("📋 Student routes loaded");

// Get student profile
router.get("/profile/:userId", authenticate, getStudentProfile);

// Get student's subjects
router.get("/subjects/:userId", authenticate, getStudentSubjects);

// Get student's lessons
router.get("/lessons/:userId", authenticate, getStudentLessons);

// Get student's materials
router.get("/materials/:userId", authenticate, getStudentMaterials);

// Get student statistics
router.get("/stats/:userId", authenticate, getStudentStats);

// Get student news
router.get("/news/:userId", authenticate, getStudentNews);

export default router;
