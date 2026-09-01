import { searchPdfChunks } from './pdfRetrievalService.js';
import { generateAnswer } from './llmService.js';

// How many chunks to excerpt into the final answer's "sources" for display.
const EXCERPT_LENGTH = 200;

/**
 * Full RAG flow for a question about one uploaded PDF:
 * search relevant chunks -> build context -> ask the LLM -> attach sources.
 *
 * Unlike ragService.js (question bank), there is no fallback chain here —
 * if no relevant chunks are found, we tell the student honestly instead of
 * calling the LLM with empty/fake context (see pdfRetrievalService.js for why).
 *
 * @param {string} documentId - the Mongo _id of the uploaded Document
 * @param {string} questionText - the student's question about the PDF
 * @returns {Promise<{answer: object|null, sources: Array, message?: string}>}
 */
export const generatePdfAnswer = async (documentId, questionText) => {
  const chunks = await searchPdfChunks(documentId, questionText, 5);

  if (chunks.length === 0) {
    return {
      answer: null,
      sources: [],
      message:
        'No relevant content was found in this document for that question. ' +
        'Try rephrasing, or the document may still be processing.'
    };
  }

  // Build the context text the LLM will ground its answer in — each chunk
  // labeled so the model (and, if logged, a developer) can see what came
  // from where.
  const contextText = chunks
    .map((chunk, index) => `[Excerpt ${index + 1}]: ${chunk.chunkText}`)
    .join('\n\n');

  const result = await generateAnswer(questionText, contextText);

  // Overwrite whatever llmService put in `sources` (it always returns []
  // itself — see llmService.js) with the real PDF chunk info, so the
  // student can see exactly which parts of their document were used.
  result.sources = chunks.map((chunk) => ({
    fileName: chunk.fileName,
    chunkIndex: chunk.chunkIndex,
    excerpt:
      chunk.chunkText.length > EXCERPT_LENGTH
        ? `${chunk.chunkText.slice(0, EXCERPT_LENGTH)}...`
        : chunk.chunkText,
    relevanceScore: chunk.score
  }));

  return result;
};

export default {
  generatePdfAnswer
};