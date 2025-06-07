// userRoutes.js


import { authenticate, requireAdmin, requireSelfOrAdmin } from '../middleware/auth.js';
import express from 'express';
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUsersByDepartment,
    getUsersByRoleAndDepartment,
    searchUsers,
    getUserById,
    getUserStats,
    getAllAdmins,
    getAllStudents,
    getAllLecturers,
    updateUser,
    deleteUser
   
} from '../controllers/userController.js'; // Adjust path as needed

// Import your authentication middleware


const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerUser);                          // POST /api/users/register
router.post('/login', loginUser);                               // POST /api/users/login



// GET Routes
router.get('/', getAllUsers);                                    // GET /api/users
router.get('/stats', getUserStats);                              // GET /api/users/stats
router.get('/search', searchUsers);                              // GET /api/users/search
router.get('/department/:department', getUsersByDepartment);     // GET /api/users/department/HNDIT
router.get('/role/:role/department/:department', getUsersByRoleAndDepartment); // GET /api/users/role/student/department/HNDIT
router.get('/:userId', getUserById);                             // GET /api/users/ST001
router.get('/role/admins', getAllAdmins);                             // GET /api/users/admins
router.get('/role/students', getAllStudents);                         // GET /api/users/students
router.get('/role/lecturers', getAllLecturers);                       // GET /api/users/lecturers

// PUT Routes
router.put('/update',authenticate,requireAdmin, updateUser);                              


// DELETE Routes
router.delete('/:userId', authenticate, requireAdmin, deleteUser);


export default router;