import express from "express";
import {
  createSubject,
  getAllSubjects,
  getSubjectsByDepartment,
  getSubjectsByYearSem,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET all subjects (with optional query params)
router.get("/", authenticate, getAllSubjects);

// GET subjects by department
router.get("/department/:departmentId", authenticate, getSubjectsByDepartment);

// GET subjects by department, year and semester
router.get(
  "/department/:departmentId/year/:year/semester/:semester",
  authenticate,
  getSubjectsByYearSem
);

// POST create new subject
router.post("/", authenticate, createSubject);

// PUT update subject
router.put("/:subjectCode", authenticate, updateSubject);

// DELETE subject - FIXED: Changed from subjectCode to id
router.delete("/:id", authenticate, deleteSubject);

export default router;
