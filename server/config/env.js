import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbbs-ai-study-assistant',
  QDRANT_URL: process.env.QDRANT_URL || '',
  QDRANT_API_KEY: process.env.QDRANT_API_KEY || '',
  LLM_API_KEY: process.env.LLM_API_KEY || '',
  EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY || ''
};

// Validate critical configurations (warn if AI keys are missing)
if (!config.MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI is not defined. Falling back to local MongoDB.');
}

if (!config.QDRANT_URL || !config.QDRANT_API_KEY) {
  console.log('INFO: Qdrant credentials not fully configured. Vector service will run in mock/local fallback mode.');
}

if (!config.LLM_API_KEY) {
  console.log('INFO: LLM_API_KEY is not set. LLM service will generate mock structured answers.');
}

if (!config.EMBEDDING_API_KEY) {
  console.log('INFO: EMBEDDING_API_KEY is not set. Embedding service will run in mock/local fallback mode.');
}

export default config;
