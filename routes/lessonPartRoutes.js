import express from "express";
import {
  createLessonPart,
  getLessonParts,
  updateLessonPart,
  deleteLessonPart,
} from "../controllers/lessonPartController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get parts for a lesson
router.get("/:lessonId", authenticate, getLessonParts);

// Create lesson part - Admin only
router.post("/", authenticate, requireAdmin, createLessonPart);

// Update lesson part - Admin only
router.put("/:id", authenticate, requireAdmin, updateLessonPart);

// Delete lesson part - Admin only
router.delete("/:id", authenticate, requireAdmin, deleteLessonPart);

export default router;
