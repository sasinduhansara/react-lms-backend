import express from 'express';
import { 
  createSubject, 
  getAllSubjects, 
  getSubjectsByDepartment,
  getSubjectsByYearSem,
  updateSubject, 
  deleteSubject 
} from '../controllers/subjectController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Only authenticated users can access these routes

// GET route to fetch all subjects - accessible to all authenticated users
router.get('/', authenticate, getAllSubjects);

// GET route to fetch subjects by department - accessible to all authenticated users
router.get('/department/:departmentId', authenticate, getSubjectsByDepartment);

// GET route to fetch subjects by department, year and semester - accessible to all authenticated users
router.get('/department/:departmentId/year/:year/semester/:semester', authenticate, getSubjectsByYearSem);

// POST route to create a new subject - admin and lecturer only
router.post('/', authenticate, createSubject);

// PUT route to update a subject - admin and lecturer only
router.put('/:subjectCode', authenticate, updateSubject);

// DELETE route to delete a subject - admin and lecturer only
router.delete('/:subjectCode', authenticate, deleteSubject);

export default router;