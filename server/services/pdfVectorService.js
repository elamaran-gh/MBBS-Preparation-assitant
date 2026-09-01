import vectorDbConfig from '../config/vectorDb.js';
import { generateEmbedding } from './embeddingService.js';

// Helper for Qdrant API requests — deliberately a separate copy from
// vectorService.js's version rather than a shared one, so this file can be
// read on its own without needing to understand a shared abstraction.
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
 * Initializes the PDF chunks collection in Qdrant if configured.
 * Same safe-degrade logic as vectorService.js's initCollection: a bad or
 * unreachable Qdrant config logs a warning and returns false, it never
 * crashes the server.
 */
export const initPdfCollection = async () => {
  if (!vectorDbConfig.isConfigured) {
    console.log('Qdrant not configured. Skipping PDF collection initialization.');
    return false;
  }

  try {
    console.log(`Checking if Qdrant collection '${vectorDbConfig.collections.pdfChunks}' exists...`);
    await qdrantFetch(`/collections/${vectorDbConfig.collections.pdfChunks}`);
    console.log(`Qdrant collection '${vectorDbConfig.collections.pdfChunks}' already exists.`);
    return true;
  } catch (error) {
    if (error.status !== 404) {
      console.error(
        `WARNING: Qdrant is configured but unreachable (${error.message}). ` +
        `Continuing without PDF vector search.`
      );
      return false;
    }

    try {
      console.log(`Creating Qdrant collection '${vectorDbConfig.collections.pdfChunks}'...`);
      await qdrantFetch(`/collections/${vectorDbConfig.collections.pdfChunks}`, {
        method: 'PUT',
        body: JSON.stringify({
          vectors: {
            size: vectorDbConfig.vectorDimensions,
            distance: 'Cosine'
          }
        })
      });
      console.log(`Qdrant collection '${vectorDbConfig.collections.pdfChunks}' created successfully.`);
      return true;
    } catch (createError) {
      console.error(
        `WARNING: Failed to create PDF Qdrant collection (${createError.message}). ` +
        `Continuing without PDF vector search.`
      );
      return false;
    }
  }
};

/**
 * Embeds and stores every chunk of one uploaded document into Qdrant.
 * Called once, right after a PDF is uploaded and chunked.
 *
 * If Qdrant isn't configured, this still "succeeds" in the sense that it
 * doesn't throw — it just has nothing to store into, matching the same
 * optional/derived-index philosophy used everywhere else in this project.
 *
 * @param {string} documentId - the Mongo _id of the Document record
 * @param {string} fileName - original uploaded file name, for display later
 * @param {string[]} chunks - array of chunk text, from chunkingService.js
 * @returns {Promise<number>} how many chunks were successfully embedded and stored
 */
export const storeChunks = async (documentId, fileName, chunks) => {
  let storedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];

    try {
      const vector = await generateEmbedding(chunkText);

      if (vectorDbConfig.isConfigured) {
        await qdrantFetch(`/collections/${vectorDbConfig.collections.pdfChunks}/points`, {
          method: 'PUT',
          body: JSON.stringify({
            points: [
              {
                id: generateNumericId(`${documentId}-${i}`),
                vector,
                payload: {
                  documentId: documentId.toString(),
                  fileName,
                  chunkIndex: i,
                  chunkText,
                  sourceType: 'uploaded_pdf',
                  pageNumber: null // pdf-parse doesn't expose per-chunk page boundaries
                }
              }
            ]
          })
        });
      }

      storedCount += 1;
      console.log(`[${i + 1}/${chunks.length}] Stored chunk for document ${documentId}`);
    } catch (error) {
      // One bad chunk shouldn't fail the whole upload — log it and continue,
      // same resilience pattern as scripts/populateVectors.js.
      console.error(`Failed to store chunk ${i} for document ${documentId}: ${error.message}`);
    }
  }

  return storedCount;
};

// Same hashing approach as vectorService.js, so Qdrant point IDs stay
// simple integers regardless of what string we build them from.
function generateNumericId(idString) {
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = (hash << 5) - hash + idString.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default {
  initPdfCollection,
  storeChunks
};