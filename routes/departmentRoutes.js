import express from 'express';
import { 
  createDepartment, 
  getAllDepartments, 
  getDepartment,
  deleteDepartment, 
  updateDepartment 
} from '../controllers/departmentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET route to fetch all departments - accessible to all authenticated users
router.get('/', authenticate, getAllDepartments);

// GET route to fetch single department - accessible to all authenticated users
router.get('/:departmentId', authenticate, getDepartment);

// POST route to create a new department - only for admins
router.post('/', authenticate, requireAdmin, createDepartment);

// PUT route to update a department by departmentId - only for admins
router.put('/:departmentId', authenticate, requireAdmin, updateDepartment);

// DELETE route to delete a department by departmentId - only for admins
router.delete('/:departmentId', authenticate, requireAdmin, deleteDepartment);

export default router;
