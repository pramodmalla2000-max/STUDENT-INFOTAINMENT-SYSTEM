import { Router } from 'express';
import { getResults, addOrUpdateResult } from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getResults);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), addOrUpdateResult);

export default router;
