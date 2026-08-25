import express from 'express';
import { getAIAnswer } from '../controllers/aiController.js';

const router = express.Router();

router.post('/answer', getAIAnswer);

export default router;
