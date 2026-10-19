import { Router } from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY'), updateComplaintStatus);

export default router;
