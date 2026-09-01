import Document from '../models/Document.js';
import { extractTextFromPdf } from '../services/pdfExtractionService.js';
import { chunkText } from '../services/chunkingService.js';
import { storeChunks } from '../services/pdfVectorService.js';
import { generatePdfAnswer } from '../services/pdfRagService.js';

/**
 * POST /api/documents/upload
 * Accepts one PDF (field name "pdf"), extracts its text, chunks it,
 * embeds and stores the chunks in Qdrant, and records the result in MongoDB.
 *
 * This is a single synchronous request/response — no background job queue
 * (per the project's "keep it simple" decision). For a 10MB PDF near the
 * 40-chunk cap at the current embedding throttle, this can take a couple
 * of minutes; the frontend (Component 9) will show a processing state
 * for the duration of this one request.
 */
export const uploadDocument = async (req, res, next) => {
  let document;

  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No PDF file was uploaded.');
    }

    document = await Document.create({
      fileName: req.file.originalname,
      status: 'processing'
    });

    const { text } = await extractTextFromPdf(req.file.buffer);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error('No usable text chunks could be created from this PDF.');
    }

    const storedCount = await storeChunks(document._id, document.fileName, chunks);

    document.status = 'ready';
    document.chunkCount = storedCount;
    await document.save();

    res.status(201).json({
      success: true,
      data: {
        documentId: document._id,
        fileName: document.fileName,
        status: document.status,
        chunkCount: document.chunkCount
      }
    });
  } catch (error) {
    // A failure here is usually a bad/unreadable PDF (student input problem),
    // not a server bug — record it on the Document if one was created, and
    // respond with a clear message rather than a generic 500.
    if (document) {
      document.status = 'failed';
      document.errorMessage = error.message;
      await document.save();
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/documents/:id
 * Lets the frontend check a document's processing status.
 */
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404);
      throw new Error('Document not found.');
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/documents/:id/ask
 * Asks a question grounded in one specific uploaded document.
 */
export const askDocumentQuestion = async (req, res, next) => {
  try {
    const { questionText } = req.body;

    if (!questionText || !questionText.trim()) {
      res.status(400);
      throw new Error('questionText is required.');
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404);
      throw new Error('Document not found.');
    }

    if (document.status !== 'ready') {
      res.status(400);
      throw new Error(
        document.status === 'processing'
          ? 'This document is still processing. Please wait and try again.'
          : `This document failed to process: ${document.errorMessage || 'unknown error'}`
      );
    }

    const result = await generatePdfAnswer(document._id, questionText);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadDocument,
  getDocument,
  askDocumentQuestion
};