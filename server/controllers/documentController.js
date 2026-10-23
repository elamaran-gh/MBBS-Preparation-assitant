import Document from '../models/Document.js';
import vectorDbConfig from '../config/vectorDb.js';
import { extractTextFromPdf } from '../services/pdfExtractionService.js';
import { chunkText } from '../services/chunkingService.js';
import { storeChunks } from '../services/pdfVectorService.js';
import { generatePdfAnswer } from '../services/pdfRagService.js';

// POST /api/documents/upload — extract, chunk, embed and store in Qdrant
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

    // If Qdrant is on but nothing was stored, fail honestly instead of reporting "ready".
    if (vectorDbConfig.isConfigured && storedCount === 0) {
      throw new Error('Chunks were created but none could be stored in Qdrant.');
    }

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
    // Log the real reason — the response alone hid it before.
    console.error(`[Upload failed] ${error.message}`);

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

// GET /api/documents/:id — processing status
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404);
      throw new Error('Document not found.');
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// POST /api/documents/:id/ask — question grounded in one uploaded document
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

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadDocument,
  getDocument,
  askDocumentQuestion
};