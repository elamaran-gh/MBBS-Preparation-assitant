import vectorDbConfig from '../config/vectorDb.js';
import { generateEmbedding } from './embeddingService.js';

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
    throw new Error(`Qdrant API error [${response.status}]: ${errorText}`);
  }

  return response.json();
};

/**
 * Finds the most relevant chunks from ONE specific uploaded document for a
 * student's question. Scoped by documentId so different students' PDFs
 * (or the question-bank collection) never mix into these results.
 *
 * IMPORTANT: unlike vectorService.searchSimilar, there is no MongoDB
 * fallback here. Chunk text only exists in Qdrant (see pdfVectorService.js —
 * we deliberately don't duplicate chunk content into MongoDB). If Qdrant
 * isn't configured or is unreachable, this returns an empty array rather
 * than pretending to have a fallback source of truth that doesn't exist.
 *
 * @param {string} documentId - the Mongo _id of the Document to search within
 * @param {string} queryText - the student's question
 * @param {number} limit - how many chunks to retrieve (default 5)
 * @returns {Promise<Array<{chunkText, chunkIndex, score, fileName}>>}
 */
export const searchPdfChunks = async (documentId, queryText, limit = 5) => {
  if (!vectorDbConfig.isConfigured) {
    console.log(
      'Qdrant not configured — PDF search has no fallback and cannot run. Returning no chunks.'
    );
    return [];
  }

  try {
    const queryVector = await generateEmbedding(queryText);

    const result = await qdrantFetch(
      `/collections/${vectorDbConfig.collections.pdfChunks}/points/search`,
      {
        method: 'POST',
        body: JSON.stringify({
          vector: queryVector,
          limit,
          with_payload: true,
          with_vector: false,
          // Only search chunks belonging to this exact document.
          filter: {
            must: [
              {
                key: 'documentId',
                match: { value: documentId.toString() }
              }
            ]
          }
        })
      }
    );

    if (!result || !result.result) {
      return [];
    }

    return result.result.map((point) => ({
      chunkText: point.payload.chunkText,
      chunkIndex: point.payload.chunkIndex,
      fileName: point.payload.fileName,
      score: point.score
    }));
  } catch (error) {
    console.error(`PDF chunk search failed: ${error.message}`);
    return [];
  }
};

export default {
  searchPdfChunks
};