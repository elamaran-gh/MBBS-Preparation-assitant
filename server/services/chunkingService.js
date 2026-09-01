// How big each chunk is, and how much consecutive chunks overlap.
// Overlap means a sentence near a chunk boundary doesn't lose its context —
// it still appears (partially) in the next chunk too.
const CHUNK_SIZE = 1000; // characters, roughly 150-200 words
const CHUNK_OVERLAP = 150; // characters

// Soft ceiling on total chunks per PDF. Keeps upload processing time and
// embedding API usage bounded — relevant after hitting a real Gemini 429
// rate limit while embedding just 30 short questions (see populateVectors.js
// testing). A very long PDF gets truncated rather than generating hundreds
// of embedding calls in one upload.
const MAX_CHUNKS = 40;

/**
 * Splits cleaned text into overlapping chunks, breaking at word boundaries
 * (never mid-word) wherever possible.
 *
 * @param {string} text - raw extracted PDF text
 * @returns {string[]} array of chunk strings, in order
 */
export const chunkText = (text) => {
  // Collapse all whitespace (multiple spaces, tabs, newlines) into single
  // spaces. PDF text extraction often has messy line breaks mid-sentence,
  // and this keeps chunk boundaries meaningful.
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  if (!cleanedText) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < cleanedText.length) {
    let end = Math.min(start + CHUNK_SIZE, cleanedText.length);

    // If we're not at the very end of the text, back up to the nearest
    // space so we don't cut a word in half.
    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(' ', end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const chunk = cleanedText.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (chunks.length >= MAX_CHUNKS) {
      console.log(`Reached MAX_CHUNKS (${MAX_CHUNKS}) — truncating rest of the document.`);
      break;
    }

    if (end >= cleanedText.length) {
      break;
    }

    // Move forward, but re-include the last CHUNK_OVERLAP characters so
    // context carries over into the next chunk.
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
};

export default {
  chunkText
};