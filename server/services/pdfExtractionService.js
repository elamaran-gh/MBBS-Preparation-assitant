import pdfParse from 'pdf-parse';

/**
 * Extracts plain text from a PDF file buffer.
 *
 * We use Multer's memory storage (see documentController.js, added later),
 * so the PDF never touches disk — it arrives here as a Buffer already in
 * memory, and once we're done reading it, nothing about the original file
 * is kept anywhere.
 *
 * @param {Buffer} pdfBuffer - the raw PDF file contents
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
export const extractTextFromPdf = async (pdfBuffer) => {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('No PDF data provided.');
  }

  const parsed = await pdfParse(pdfBuffer);

  const text = parsed.text.trim();

  if (!text) {
    // Common cause: a scanned PDF (just images of pages, no real text layer).
    // pdf-parse can only read text that's actually embedded in the PDF —
    // OCR is out of scope for this prototype.
    throw new Error(
      'No readable text found in this PDF. It may be a scanned document without a text layer.'
    );
  }

  return {
    text,
    pageCount: parsed.numpages
  };
};

export default {
  extractTextFromPdf
};