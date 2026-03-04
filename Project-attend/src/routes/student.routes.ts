import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // All student routes require authentication

router.get('/', getStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
