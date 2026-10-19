import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  getCourses,
  createCourse,
  getSubjects,
  createSubject,
  getFaculty,
  createFaculty,
} from '../controllers/academicController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Department endpoints
router.get('/departments', getDepartments);
router.post('/departments', authorize('SUPER_ADMIN', 'ADMIN'), createDepartment);

// Course endpoints
router.get('/courses', getCourses);
router.post('/courses', authorize('SUPER_ADMIN', 'ADMIN'), createCourse);

// Subject endpoints
router.get('/subjects', getSubjects);
router.post('/subjects', authorize('SUPER_ADMIN', 'ADMIN'), createSubject);

// Faculty endpoints
router.get('/faculty', getFaculty);
router.post('/faculty', authorize('SUPER_ADMIN', 'ADMIN'), createFaculty);

export default router;
