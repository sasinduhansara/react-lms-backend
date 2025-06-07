import express from "express";
import {
  createNews,
  getAllNews,
  deleteNews,
  updateNews,
  getNewsByTitle,
} from "../controllers/newsController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all news - Accessible to all authenticated users
router.get("/", authenticate, getAllNews);

// Get single news by title - Accessible to all authenticated users
router.get("/:title", authenticate, getNewsByTitle);

// Create news - Admin only
router.post("/", authenticate, requireAdmin, createNews);

// Update news by title - Admin only
router.put("/:title", authenticate, requireAdmin, updateNews);

// Delete news by title - Admin only
router.delete("/:title", authenticate, requireAdmin, deleteNews);

export default router;
