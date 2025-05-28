import express from 'express';
import { 
  createNews,
  getAllNews,
  deleteNews,
  updateNews
  
} from '../controllers/newsController.js';
import { authenticate } from '../middleware/auth.js';
import e from 'express';

const router = express.Router();

//create news - Admin only
router.post('/', authenticate, createNews);

//get all news - Accessible to all authenticated users
router.get('/', authenticate, getAllNews);

//delete news by newsTitle - Admin only
router.delete('/:title', authenticate, deleteNews);

//update news by newsTitle - Admin only
router.put('/:title', authenticate, updateNews);


export default router;


