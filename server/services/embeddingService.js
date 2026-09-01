import config from '../config/env.js';
import vectorDbConfig from '../config/vectorDb.js';

// Google retired text-embedding-004 on Jan 14, 2026 — now using gemini-embedding-001,
// its default output is 3072 dimensions, but it supports Matryoshka-based truncation
// via outputDimensionality, so we request 768 to match our existing Qdrant collection
// (see config/vectorDb.js — single source of truth for the dimension value).
const EMBEDDING_DIMENSIONS = vectorDbConfig.vectorDimensions;
const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';

// Simple throttle: guarantees at least this many ms between real Gemini calls,
// so frequent dev testing (or bulk-embedding many questions in one loop later)
// can't burst past the free-tier per-minute quota. No caching — just spacing.
// Widened from 1200ms after hitting a real 429 rate-limit around request #23
// in a single populate-vectors run — this project's actual free-tier RPM
// ceiling for the embedding endpoint is lower than the token-per-minute
// limit alone would suggest. 4000ms keeps us safely under it.
const MIN_REQUEST_INTERVAL_MS = 4000;
let lastRequestTimestamp = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const throttleGeminiRequest = async () => {
  const elapsed = Date.now() - lastRequestTimestamp;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
  }
  lastRequestTimestamp = Date.now();
};

/**
 * Calls Google Gemini's gemini-embedding-001 API, truncated to 768 dimensions.
 * Throws on failure so the caller can fall back to the local generator.
 */
const generateGeminiEmbedding = async (text) => {
  await throttleGeminiRequest();

  const response = await fetch(`${GEMINI_EMBED_URL}?key=${config.EMBEDDING_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      // SEMANTIC_SIMILARITY fits our use case: we embed question text both when
      // indexing (populateVectors.js) and when querying (searchSimilar), so it's
      // symmetric question-to-question comparison rather than asymmetric retrieval.
      taskType: 'SEMANTIC_SIMILARITY',
      outputDimensionality: EMBEDDING_DIMENSIONS
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini embedding API error [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const values = data?.embedding?.values;

  if (!Array.isArray(values)) {
    throw new Error('Gemini embedding API returned an unexpected response shape.');
  }

  return values;
};

/**
 * Local deterministic fallback embedding generator for development
 * (used when EMBEDDING_API_KEY is not set, or if the live call fails).
 * Not a real semantic embedding — just keeps the RAG pipeline runnable offline.
 */
const generateLocalFallbackEmbedding = (text) => {
  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    const value = Math.sin(hash + i) * 0.5 + 0.5; // value between 0 and 1
    vector[i] = parseFloat(value.toFixed(4));
  }

  return vector;
};

/**
 * Service to generate text embeddings.
 */
export const generateEmbedding = async (text) => {
  if (!text) return new Array(EMBEDDING_DIMENSIONS).fill(0);

  if (config.EMBEDDING_API_KEY) {
    try {
      return await generateGeminiEmbedding(text);
    } catch (error) {
      console.error('Failed to generate live Gemini embedding, using local fallback:', error.message);
    }
  }

  return generateLocalFallbackEmbedding(text);
};

export default {
  generateEmbedding
};