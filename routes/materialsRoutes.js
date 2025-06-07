import express from "express";
import {
  uploadMaterial,
  getAllMaterials,
  getMaterialsBySubject,
  updateMaterial,
  deleteMaterial,
} from "../controllers/materialsController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Upload material (Admin & Lecturer)
router.post("/", authenticate, requireAdmin, uploadMaterial);

// Get all materials (All authenticated users)
router.get("/", authenticate, getAllMaterials);

// Get materials by subject (All authenticated users)
router.get("/subject/:subjectId", authenticate, getMaterialsBySubject);

// Update material (Admin & Uploader)
router.put("/:id", authenticate, updateMaterial);

// Delete material (Admin & Uploader)
router.delete("/:id", authenticate, deleteMaterial);

export default router;
