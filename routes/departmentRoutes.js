import express from 'express';
import { 
  createDepartment, 
  getAllDepartments, 
  deleteDepartment, 
  updateDepartment 
} from '../controllers/departmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();


// Only authenticated users can access these routes

// GET route to fetch all departments - accessible to all authenticated users
router.get('/', authenticate, getAllDepartments);

// POST route to create a new department - only for admins
router.post('/', authenticate, createDepartment);

// PUT route to update a department by departmentId - only for admins
router.put('/:departmentId', authenticate, updateDepartment);

// DELETE route to delete a department by departmentId - only for admins
router.delete('/:departmentId', authenticate, deleteDepartment);

export default router;
