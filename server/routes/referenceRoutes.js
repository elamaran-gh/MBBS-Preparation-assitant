import express from 'express';
import { getReferenceById } from '../controllers/referenceController.js';

const router = express.Router();

router.get('/:id', getReferenceById);

export default router;
