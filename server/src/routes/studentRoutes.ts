import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, authorize, studentAccessGuard } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), getStudents);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createStudent);
router.get('/:id', studentAccessGuard, getStudentById);
router.put('/:id', studentAccessGuard, updateStudent);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteStudent);

export default router;
