import { Router } from 'express';
import authRoutes from './authRoutes.js';
import studentRoutes from './studentRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import resultRoutes from './resultRoutes.js';
import achievementRoutes from './achievementRoutes.js';
import certificateRoutes from './certificateRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import documentRoutes from './documentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import searchRoutes from './searchRoutes.js';
import reportRoutes from './reportRoutes.js';
import auditRoutes from './auditRoutes.js';
import settingRoutes from './settingRoutes.js';
import academicRoutes from './academicRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/results', resultRoutes);
router.use('/achievements', achievementRoutes);
router.use('/certificates', certificateRoutes);
router.use('/complaints', complaintRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/settings', settingRoutes);
router.use('/academic', academicRoutes);

export default router;
