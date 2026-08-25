import ragService from '../services/ragService.js';
import Question from '../models/Question.js';

/**
 * POST /api/ai/answer
 * Generate a structured RAG answer.
 * Body parameters:
 *  - questionId: optional Mongo ID of the question
 *  - questionText: optional custom question text (used if questionId is absent)
 */
export const getAIAnswer = async (req, res, next) => {
  try {
    const { questionId, questionText } = req.body;

    let targetText = questionText;
    let resolvedQuestionId = questionId;

    if (questionId) {
      const question = await Question.findById(questionId);
      if (!question) {
        res.status(404);
        throw new Error('Question not found');
      }
      targetText = question.questionText;
    }

    if (!targetText) {
      res.status(400);
      throw new Error('Please provide either questionId or questionText');
    }

    console.log(`Generating AI Answer for: "${targetText.substring(0, 60)}..."`);
    
    // Process through RAG service
    const output = await ragService.generateAnswer(targetText, resolvedQuestionId);

    res.status(200).json({
      success: true,
      data: output
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAIAnswer
};
