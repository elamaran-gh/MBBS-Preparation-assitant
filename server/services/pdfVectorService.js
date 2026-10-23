import vectorDbConfig from '../config/vectorDb.js';
import { generateEmbedding } from './embeddingService.js';
import { buildPdfChunkPoint } from '../models/PdfChunk.js';

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

// Qdrant rejects filtered searches on a field with no payload index.
// Safe to repeat, so it runs for both new and existing collections.
const ensureDocumentIdIndex = async () => {
  await qdrantFetch(`/collections/${vectorDbConfig.collections.pdfChunks}/index?wait=true`, {
    method: 'PUT',
    body: JSON.stringify({ field_name: 'documentId', field_schema: 'keyword' })
  });
};

export const initPdfCollection = async () => {
  if (!vectorDbConfig.isConfigured) {
    console.log('Qdrant not configured. Skipping PDF collection initialization.');
    return false;
  }

  try {
    console.log(`Checking if Qdrant collection '${vectorDbConfig.collections.pdfChunks}' exists...`);
    await qdrantFetch(`/collections/${vectorDbConfig.collections.pdfChunks}`);
    console.log(`Qdrant collection '${vectorDbConfig.collections.pdfChunks}' already exists.`);
    await ensureDocumentIdIndex();
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
      // Short pause so a brand-new collection is ready before the first write.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await ensureDocumentIdIndex();
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

export const storeChunks = async (documentId, fileName, chunks) => {
  let storedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    try {
      const vector = await generateEmbedding(chunks[i]);

      if (vectorDbConfig.isConfigured) {
        const point = buildPdfChunkPoint({
          documentId,
          fileName,
          chunkIndex: i,
          chunkText: chunks[i],
          vector
        });

        await qdrantFetch(`/collections/${vectorDbConfig.collections.pdfChunks}/points?wait=true`, {
          method: 'PUT',
          body: JSON.stringify({ points: [point] })
        });
      }

      storedCount += 1;
      console.log(`[${i + 1}/${chunks.length}] Stored chunk for document ${documentId}`);
    } catch (error) {
      console.error(`Failed to store chunk ${i} for document ${documentId}: ${error.message}`);
    }
  }

  return storedCount;
};

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