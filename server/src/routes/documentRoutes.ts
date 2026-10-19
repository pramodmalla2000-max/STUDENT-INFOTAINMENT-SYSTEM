import { Router } from 'express';
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.get('/', getDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteDocument);

export default router;
