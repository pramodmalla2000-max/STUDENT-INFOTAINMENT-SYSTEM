import { Router } from 'express';
import {
  getAchievements,
  createAchievement,
  verifyAchievement,
  deleteAchievement,
} from '../controllers/achievementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getAchievements);
router.post('/', createAchievement);
router.put('/:id/verify', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), verifyAchievement);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteAchievement);

export default router;
