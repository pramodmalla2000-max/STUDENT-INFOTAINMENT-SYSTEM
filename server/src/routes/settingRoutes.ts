import { Router } from 'express';
import { getSettings, updateSetting } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getSettings);
router.put('/', authorize('SUPER_ADMIN', 'ADMIN'), updateSetting);

export default router;
