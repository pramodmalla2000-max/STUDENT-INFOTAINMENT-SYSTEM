import { Router } from 'express';
import {
  getAttendance,
  markAttendance,
  markBulkAttendance,
  getStudentSubjectAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize, studentAccessGuard } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getAttendance);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), markAttendance);
router.post('/bulk', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), markBulkAttendance);
router.get('/student/:studentId', studentAccessGuard, getStudentSubjectAttendance);

export default router;
