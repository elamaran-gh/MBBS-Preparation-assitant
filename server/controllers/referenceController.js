import Reference from '../models/Reference.js';

/**
 * GET /api/references/:id
 * Retrieve a textbook reference detail by ID.
 */
export const getReferenceById = async (req, res, next) => {
  try {
    const reference = await Reference.findById(req.params.id);
    
    if (!reference) {
      res.status(404);
      throw new Error('Reference source not found');
    }

    res.status(200).json({
      success: true,
      data: reference
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getReferenceById
};
