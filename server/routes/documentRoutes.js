import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import {
  uploadDocument,
  getDocument,
  askDocumentQuestion
} from '../controllers/documentController.js';

const router = express.Router();

router.post('/upload', upload.single('pdf'), uploadDocument);
router.get('/:id', getDocument);
router.post('/:id/ask', askDocumentQuestion);

export default router;