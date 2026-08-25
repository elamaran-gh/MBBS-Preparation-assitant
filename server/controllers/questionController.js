import Question from '../models/Question.js';
import vectorService from '../services/vectorService.js';
import embeddingService from '../services/embeddingService.js';

/**
 * GET /api/questions
 * Get list of questions, optional pagination, and aggregate filters.
 */
export const getQuestions = async (req, res, next) => {
  try {
    const { subject, university, year, limit = 10, page = 1 } = req.query;
    const query = {};

    if (subject) query.subject = subject;
    if (university) query.university = university;
    if (year) query.year = parseInt(year);

    const questions = await Question.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('referenceIds');

    const total = await Question.countDocuments(query);

    // Dynamic aggregations to feed filter lists in the UI
    const subjects = await Question.distinct('subject');
    const universities = await Question.distinct('university');
    const years = await Question.distinct('year');

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      data: questions,
      filters: {
        subjects,
        universities,
        years: years.sort((a, b) => b - a) // Descending order
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/questions/search
 * Search questions by text matching and filters.
 */
export const searchQuestions = async (req, res, next) => {
  try {
    const { q, subject, university, year, limit = 10 } = req.query;
    
    let filterQuery = {};
    if (subject) filterQuery.subject = subject;
    if (university) filterQuery.university = university;
    if (year) filterQuery.year = parseInt(year);

    let questions = [];

    if (q) {
      // Find matching items via text index, merging filters
      questions = await Question.find({
        $and: [
          { $text: { $search: q } },
          filterQuery
        ]
      })
      .limit(parseInt(limit))
      .populate('referenceIds');
      
      // If text index yielded empty results, fallback to regex search
      if (questions.length === 0) {
        questions = await Question.find({
          $and: [
            {
              $or: [
                { questionText: { $regex: q, $options: 'i' } },
                { topic: { $regex: q, $options: 'i' } },
                { chapter: { $regex: q, $options: 'i' } }
              ]
            },
            filterQuery
          ]
        })
        .limit(parseInt(limit))
        .populate('referenceIds');
      }
    } else {
      questions = await Question.find(filterQuery)
        .limit(parseInt(limit))
        .populate('referenceIds');
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/questions/:id
 * Get single question detail.
 */
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate('referenceIds');
    
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/questions/:id/similar
 * Get semantically similar questions.
 */
export const getSimilarQuestions = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    // 1. Generate embedding for current question text
    const queryVector = await embeddingService.generateEmbedding(question.questionText);

    // 2. Query vector database (or local MongoDB fallback)
    const rawMatches = await vectorService.searchSimilar(queryVector, 5, question.questionText);

    // 3. Resolve results, omitting the source question itself
    const filteredMatches = rawMatches.filter(m => m.mongoId !== question._id.toString());

    // Resolve full question details from database
    const matchIds = filteredMatches.map(m => m.mongoId);
    const resolvedQuestions = await Question.find({ _id: { $in: matchIds } }).populate('referenceIds');

    // Combine question details with similarity scores
    const data = filteredMatches.map(match => {
      const qDetail = resolvedQuestions.find(q => q._id.toString() === match.mongoId);
      return {
        similarityScore: match.score,
        question: qDetail || match.question // Fallback to raw object from vectorService if not found
      };
    }).filter(item => item.question !== undefined);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getQuestions,
  searchQuestions,
  getQuestionById,
  getSimilarQuestions
};
