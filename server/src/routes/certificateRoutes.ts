import { Router } from 'express';
import {
  getCertificates,
  createCertificate,
  verifyCertificateByNumber,
} from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public verification route
router.get('/verify/:certificateNumber', verifyCertificateByNumber);

// Protected routes
router.use(protect);
router.get('/', getCertificates);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), createCertificate);

export default router;
