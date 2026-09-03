// Runs before any test file's imports are evaluated (see jest.config.js
// "setupFiles"). Forces the app into its built-in mock/local-fallback mode
// for LLM, embedding, and vector services — even if the developer's local
// .env has real API keys configured for manual/browser testing.
process.env.LLM_API_KEY = '';
process.env.EMBEDDING_API_KEY = '';
process.env.QDRANT_URL = '';
process.env.QDRANT_API_KEY = '';
