import express from 'express';
import {
  getQuestions,
  searchQuestions,
  getQuestionById,
  getSimilarQuestions
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/', getQuestions);
router.get('/search', searchQuestions);
router.get('/:id', getQuestionById);
router.get('/:id/similar', getSimilarQuestions);

export default router;
