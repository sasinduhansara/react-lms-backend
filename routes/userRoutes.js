
import express from 'express';
import {
  loginUser,
  registerUser,
  deleteUserByEmail,
  updateUser
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const userRouter = express.Router();

//user registration route
userRouter.post('/', registerUser);

// user login route
userRouter.post('/login', loginUser);

// user delete route 
userRouter.delete('/admin/delete', authenticate, deleteUserByEmail);

// user update route 
userRouter.put('/update', authenticate, updateUser);

export default userRouter;