import config from './env.js';

const isVectorDbConfigured = !!(config.QDRANT_URL && config.QDRANT_API_KEY);

export const vectorDbConfig = {
  url: config.QDRANT_URL,
  apiKey: config.QDRANT_API_KEY,
  isConfigured: isVectorDbConfigured,
  collectionName: 'mbbs_questions'
};

export default vectorDbConfig;
