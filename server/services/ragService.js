import embeddingService from './embeddingService.js';
import vectorService from './vectorService.js';
import llmService from './llmService.js';
import Reference from '../models/Reference.js';
import Question from '../models/Question.js';

/**
 * Retrieves relevant context based on question text.
 */
export const retrieveContext = async (questionText, limit = 3) => {
  try {
    // 1. Generate query embedding
    const queryVector = await embeddingService.generateEmbedding(questionText);
    
    // 2. Perform semantic search (returns list of items with mongoId)
    const matches = await vectorService.searchSimilar(queryVector, limit, questionText);
    
    // 3. Extract MongoDB IDs for reference retrieval
    // In our prototype, similar vectors might match either Questions (which have referenceIds) or References directly.
    // If the vector search returns Questions, let's load those questions and fetch their reference document contents.
    // Let's resolve the references.
    let references = [];
    const questionIds = matches.map(m => m.mongoId);
    
    // Find questions corresponding to matched IDs
    const matchedQuestions = await Question.find({ _id: { $in: questionIds } }).populate('referenceIds');
    
    // Gather all unique referenceIds
    const referenceIdsSet = new Set();
    matchedQuestions.forEach(q => {
      if (q.referenceIds && q.referenceIds.length > 0) {
        q.referenceIds.forEach(ref => {
          if (ref._id) {
            referenceIdsSet.add(ref._id.toString());
          } else {
            referenceIdsSet.add(ref.toString());
          }
        });
      }
    });

    const uniqueReferenceIds = Array.from(referenceIdsSet);

    if (uniqueReferenceIds.length > 0) {
      references = await Reference.find({ _id: { $in: uniqueReferenceIds } });
    }

    // Fallback: If no references found through matched questions, grab a few reference files
    if (references.length === 0) {
      // Find reference content matching words in question text
      const searchWords = questionText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (searchWords.length > 0) {
        const queryRegex = searchWords.map(word => new RegExp(word, 'i'));
        references = await Reference.find({
          $or: [
            { topic: { $in: queryRegex } },
            { chapter: { $in: queryRegex } },
            { content: { $in: queryRegex } }
          ]
        }).limit(limit);
      }
    }

    if (references.length === 0) {
      // Default fallback references
      references = await Reference.find().limit(limit);
    }

    return references;
  } catch (error) {
    console.error('RAG Retrieval failed:', error);
    return [];
  }
};

/**
 * Formats textbook/reference articles into a context block.
 */
export const buildContext = (references) => {
  if (!references || references.length === 0) {
    return 'No relevant textbook references found in the database.';
  }

  return references.map((ref, idx) => {
    return `[Reference ${idx + 1}]
Source: ${ref.bookName} (Chapter: ${ref.chapter}, Topic: ${ref.topic}, Page: ${ref.pageNumber || 'N/A'})
Content: ${ref.content}`;
  }).join('\n\n');
};

/**
 * Coordinates Retrieval, Context building, and LLM query.
 */
export const generateAnswer = async (questionText, questionId = null) => {
  // 1. Retrieve relevant references
  let references = [];
  
  if (questionId) {
    // If a specific question ID is provided, retrieve its explicit references first
    const question = await Question.findById(questionId).populate('referenceIds');
    if (question && question.referenceIds && question.referenceIds.length > 0) {
      references = question.referenceIds;
    }
  }
  
  // If no references resolved yet, perform semantic search
  if (references.length === 0) {
    references = await retrieveContext(questionText, 3);
  }

  // 2. Format context
  const context = buildContext(references);

  // 3. Query LLM
  const prompt = `Explain the following medical question for an MBBS exam: "${questionText}"`;
  const result = await llmService.generateAnswer(prompt, context);

  // 4. Attach sources to final response
  result.sources = references.map(ref => ({
    _id: ref._id,
    bookName: ref.bookName,
    chapter: ref.chapter,
    topic: ref.topic,
    content: ref.content,
    pageNumber: ref.pageNumber,
    source: ref.source
  }));

  return result;
};

export default {
  retrieveContext,
  buildContext,
  generateAnswer
};
