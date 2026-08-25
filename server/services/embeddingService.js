import config from '../config/env.js';

/**
 * Service to generate text embeddings.
 */
export const generateEmbedding = async (text) => {
  if (!text) return new Array(384).fill(0);

  if (config.EMBEDDING_API_KEY) {
    try {
      // TODO: Replace with your actual embedding API call (e.g., Cohere, OpenAI, or Gemini)
      // Example using a generic fetch call:
      /*
      const response = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.EMBEDDING_API_KEY}`
        },
        body: JSON.stringify({
          texts: [text],
          model: 'embed-english-v3.0',
          input_type: 'search_query'
        })
      });
      const data = await response.json();
      return data.embeddings[0];
      */
      
      console.log('Embedding API configured. Generating live embedding (stub)...');
    } catch (error) {
      console.error('Failed to generate live embedding, using local fallback:', error);
    }
  }

  // Local deterministic fallback embedding generator for development
  // Generates a mock 384-dimension vector from the text hashing
  const vector = new Array(384).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  for (let i = 0; i < 384; i++) {
    const value = Math.sin(hash + i) * 0.5 + 0.5; // value between 0 and 1
    vector[i] = parseFloat(value.toFixed(4));
  }
  
  return vector;
};

export default {
  generateEmbedding
};
