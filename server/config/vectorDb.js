import config from './env.js';

const isVectorDbConfigured = !!(config.QDRANT_URL && config.QDRANT_API_KEY);

export const vectorDbConfig = {
  url: config.QDRANT_URL,
  apiKey: config.QDRANT_API_KEY,
  isConfigured: isVectorDbConfigured,

  // Two separate collections so curated question-bank content and a
  // student's uploaded PDF content never mix in semantic search results.
  collections: {
    questions: 'mbbs_question_vectors',
    pdfChunks: 'mbbs_pdf_chunks'
  },

  // Must match the embedding provider's output size (gemini-embedding-001
  // truncated to 768). Single source of truth — embeddingService.js and
  // both vector services read this.
  vectorDimensions: 768
};

export default vectorDbConfig;