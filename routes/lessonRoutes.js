import express from "express";
import {
  createLesson,
  getAllLessons,
  updateLesson,
  deleteLesson,
  incrementPartsCount,
} from "../controllers/lessonController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all lessons
router.get("/", authenticate, getAllLessons);

// Create lesson - Admin only
router.post("/", authenticate, requireAdmin, createLesson);

// Update lesson - Admin only
router.put("/:id", authenticate, requireAdmin, updateLesson);

// Delete lesson - Admin only
router.delete("/:id", authenticate, requireAdmin, deleteLesson);

// Increment parts count
router.put(
  "/:id/increment-parts",
  authenticate,
  requireAdmin,
  incrementPartsCount
);

export default router;
