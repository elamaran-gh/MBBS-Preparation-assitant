import config from './env.js';

const isVectorDbConfigured = !!(config.QDRANT_URL && config.QDRANT_API_KEY);

export const vectorDbConfig = {
  url: config.QDRANT_URL,
  apiKey: config.QDRANT_API_KEY,
  isConfigured: isVectorDbConfigured,
  collectionName: 'mbbs_questions',
  // Must match the embedding provider's output size (Gemini text-embedding-004 = 768).
  // Single source of truth — embeddingService.js and vectorService.js both read this.
  vectorDimensions: 768
};

export default vectorDbConfig;