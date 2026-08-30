import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // Stable ID from our dataset.
    // MongoDB will still create its own _id automatically.
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    university: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    chapter: {
      type: String,
      trim: true,
    },

    topic: {
      type: String,
      trim: true,
    },

    questionType: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      trim: true,
    },

    // MongoDB relationship to Reference documents
    referenceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Text index required by:
// - questionController.searchQuestions ($text search on GET /api/questions/search)
// - vectorService.searchSimilar's MongoDB fallback (used when Qdrant isn't configured)
// Weighted so a match in questionText ranks higher than a match in topic/chapter.
questionSchema.index(
  { questionText: "text", topic: "text", chapter: "text" },
  { weights: { questionText: 5, topic: 3, chapter: 1 }, name: "QuestionTextIndex" }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;