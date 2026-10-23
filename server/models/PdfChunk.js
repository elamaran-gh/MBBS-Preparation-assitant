// Shape of one PDF chunk point stored in the Qdrant collection `mbbs_pdf_chunks`.
// Qdrant has no schema, so this file is the single source of truth for the fields.

export const PDF_CHUNK_SOURCE_TYPE = 'uploaded_pdf';

// Qdrant point IDs must be integers or UUIDs, so hash a readable string into an integer.
export const buildPointId = (documentId, chunkIndex) => {
  const idString = `${documentId}-${chunkIndex}`;
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = (hash << 5) - hash + idString.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Builds a complete Qdrant point: id + embedding vector + payload.
export const buildPdfChunkPoint = ({ documentId, fileName, chunkIndex, chunkText, vector }) => {
  if (!documentId || !chunkText || !Array.isArray(vector)) {
    throw new Error('PdfChunk needs documentId, chunkText and a vector array.');
  }

  return {
    id: buildPointId(documentId, chunkIndex),
    vector,
    payload: {
      documentId: documentId.toString(), // links the chunk back to the Mongo Document record
      fileName,
      chunkIndex,
      chunkText,
      sourceType: PDF_CHUNK_SOURCE_TYPE,
      pageNumber: null // pdf-parse doesn't expose page boundaries per chunk
    }
  };
};

export default { buildPdfChunkPoint, buildPointId, PDF_CHUNK_SOURCE_TYPE };