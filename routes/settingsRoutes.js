import express from "express";
import {
  getSettings,
  updateSettings,
  getSystemStats,
  performMaintenance,
  resetSystemData,
  exportSystemData,
} from "../controllers/settingsController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get system settings
router.get("/", authenticate, requireAdmin, getSettings);

// Update system settings
router.put("/", authenticate, requireAdmin, updateSettings);

// Get system statistics
router.get("/stats", authenticate, requireAdmin, getSystemStats);

// Perform maintenance operations
router.post("/maintenance", authenticate, requireAdmin, performMaintenance);

// Reset system data
router.post("/reset", authenticate, requireAdmin, resetSystemData);

// Export system data
router.get("/export", authenticate, requireAdmin, exportSystemData);

export default router;
