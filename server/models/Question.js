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

const Question = mongoose.model("Question", questionSchema);

export default Question;