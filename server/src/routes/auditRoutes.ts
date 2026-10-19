import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/', getAuditLogs);

export default router;
