import { Router } from 'express';
import {
  getAdminDashboard,
  getStudentDashboard,
  getParentDashboard,
  getFacultyDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/admin', authorize('SUPER_ADMIN', 'ADMIN'), getAdminDashboard);
router.get('/student', authorize('STUDENT', 'SUPER_ADMIN', 'ADMIN'), getStudentDashboard);
router.get('/parent', authorize('PARENT', 'SUPER_ADMIN', 'ADMIN'), getParentDashboard);
router.get('/faculty', authorize('FACULTY', 'SUPER_ADMIN', 'ADMIN'), getFacultyDashboard);

export default router;
