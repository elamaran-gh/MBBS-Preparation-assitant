import mongoose from "mongoose";

const referenceSchema = new mongoose.Schema(
  {
    // Stable ID from references.json
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    bookName: {
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

    content: {
      type: String,
      required: true,
    },

    pageNumber: {
      type: Number,
      default: null,
    },

    source: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reference = mongoose.model("Reference", referenceSchema);

export default Reference;