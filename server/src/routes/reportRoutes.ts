import { Router } from 'express';
import {
  exportStudentsReport,
  exportResultsReport,
  exportComplaintsReport,
  exportAchievementsReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/students', exportStudentsReport);
router.get('/results', exportResultsReport);
router.get('/complaints', exportComplaintsReport);
router.get('/achievements', exportAchievementsReport);

export default router;
