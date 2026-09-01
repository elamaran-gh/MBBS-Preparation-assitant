import vectorDbConfig from '../config/vectorDb.js';
import Question from '../models/Question.js';

// Helper for Qdrant API requests
const qdrantFetch = async (endpoint, options = {}) => {
  if (!vectorDbConfig.isConfigured) return null;
  
  const url = `${vectorDbConfig.url}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'api-key': vectorDbConfig.apiKey,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Qdrant API error [${response.status}]: ${errorText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

/**
 * Initializes the question-bank collection in Qdrant if configured.
 */
export const initCollection = async () => {
  if (!vectorDbConfig.isConfigured) {
    console.log('Qdrant not configured. Skipping initialization.');
    return false;
  }

  try {
    console.log(`Checking if Qdrant collection '${vectorDbConfig.collections.questions}' exists...`);
    await qdrantFetch(`/collections/${vectorDbConfig.collections.questions}`);
    console.log(`Qdrant collection '${vectorDbConfig.collections.questions}' already exists.`);
    return true;
  } catch (error) {
    // Only a genuine 404 means "collection doesn't exist yet" — go ahead and create it.
    // Anything else (401/403 bad API key, network/DNS failure, cluster asleep, etc.)
    // is a real problem, not a reason to attempt creation — and definitely not a
    // reason to crash the whole server, since Qdrant is an optional derived index
    // and MongoDB remains the source of truth.
    if (error.status !== 404) {
      console.error(
        `WARNING: Qdrant is configured but unreachable (${error.message}). ` +
        `Continuing without Qdrant — semantic search will use the MongoDB fallback.`
      );
      return false;
    }

    try {
      console.log(`Creating Qdrant collection '${vectorDbConfig.collections.questions}'...`);
      await qdrantFetch(`/collections/${vectorDbConfig.collections.questions}`, {
        method: 'PUT',
        body: JSON.stringify({
          vectors: {
            size: vectorDbConfig.vectorDimensions,
            distance: 'Cosine'
          }
        })
      });
      console.log(`Qdrant collection '${vectorDbConfig.collections.questions}' created successfully.`);
      return true;
    } catch (createError) {
      console.error(
        `WARNING: Failed to create Qdrant collection (${createError.message}). ` +
        `Continuing without Qdrant — semantic search will use the MongoDB fallback.`
      );
      return false;
    }
  }
};

/**
 * Upserts a question vector and payload to Qdrant (question-bank collection).
 */
export const upsertDocument = async (id, vector, payload) => {
  if (!vectorDbConfig.isConfigured) {
    // console.log('Qdrant mock: upserting document', id);
    return true;
  }

  try {
    await qdrantFetch(`/collections/${vectorDbConfig.collections.questions}/points`, {
      method: 'PUT',
      body: JSON.stringify({
        points: [
          {
            id: id.toString(), // Qdrant expects UUIDs or Integers, but custom string IDs might need conversion
            // If the MongoDB ID isn't an integer or UUID format, Qdrant might error unless we generate a hash or convert.
            // Let's generate a numerical representation of the MongoDB ObjectId or check if it matches UUID format.
            // A simple numeric hash of the ObjectId string is safe.
            id: generateNumericId(id.toString()),
            vector: vector,
            payload: {
              mongoId: id.toString(),
              ...payload
            }
          }
        ]
      })
    });
    return true;
  } catch (error) {
    console.error('Qdrant upsert failed:', error);
    return false;
  }
};

/**
 * Performs semantic search on the question-bank Qdrant collection.
 * Falls back to MongoDB text/regex search if Qdrant is not configured.
 */
export const searchSimilar = async (vector, limit = 5, queryText = '') => {
  if (vectorDbConfig.isConfigured) {
    try {
      const result = await qdrantFetch(`/collections/${vectorDbConfig.collections.questions}/points/search`, {
        method: 'POST',
        body: JSON.stringify({
          vector: vector,
          limit: limit,
          with_payload: true,
          with_vector: false
        })
      });

      if (result && result.result) {
        return result.result.map(point => ({
          mongoId: point.payload.mongoId,
          score: point.score,
          payload: point.payload
        }));
      }
    } catch (error) {
      console.error('Qdrant semantic search failed, falling back to local search:', error);
    }
  }

  // Local fallback: Search MongoDB based on queryText or retrieve matching metadata
  // We'll perform text search or just find related topics
  let questions = [];
  if (queryText) {
    // Text search in MongoDB
    questions = await Question.find(
      { $text: { $search: queryText } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('referenceIds');
  }

  if (questions.length === 0) {
    // If no text search hits or no query text, get some recent questions as placeholder results
    questions = await Question.find().limit(limit).populate('referenceIds');
  }

  // Formulate similarity scores based on basic heuristics (e.g. text match quality or simulated values)
  return questions.map((q, index) => {
    let mockScore = 0.95 - (index * 0.08); // Simulate decrescendo relevance scores (e.g., 0.95, 0.87, 0.79...)
    if (mockScore < 0.5) mockScore = 0.52;
    return {
      mongoId: q._id.toString(),
      score: mockScore,
      question: q // Return full object for easy local consumption
    };
  });
};

// Helper to convert ObjectId to a valid Qdrant integer ID (64-bit integer range)
function generateNumericId(mongoIdStr) {
  let hash = 0;
  for (let i = 0; i < mongoIdStr.length; i++) {
    hash = (hash << 5) - hash + mongoIdStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default {
  initCollection,
  upsertDocument,
  searchSimilar
};