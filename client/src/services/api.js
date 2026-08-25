const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Helper to execute fetch requests with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  /**
   * Fetches all questions with optional filters (subject, university, year, page)
   */
  getQuestions: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) query.append(key, params[key]);
    });
    return apiRequest(`/questions?${query.toString()}`);
  },

  /**
   * Searches questions with keyword and filters
   */
  searchQuestions: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) query.append(key, params[key]);
    });
    return apiRequest(`/questions/search?${query.toString()}`);
  },

  /**
   * Retrieves single question details by ID
   */
  getQuestionById: (id) => {
    return apiRequest(`/questions/${id}`);
  },

  /**
   * Retrieves semantically similar questions for a specific question ID
   */
  getSimilarQuestions: (id) => {
    return apiRequest(`/questions/${id}/similar`);
  },

  /**
   * Retrieves textbook reference information by ID
   */
  getReferenceById: (id) => {
    return apiRequest(`/references/${id}`);
  },

  /**
   * Submits question for RAG-based structured answer generation
   */
  generateAIAnswer: (questionId, questionText = '') => {
    return apiRequest('/ai/answer', {
      method: 'POST',
      body: JSON.stringify({ questionId, questionText })
    });
  }
};

export default api;
