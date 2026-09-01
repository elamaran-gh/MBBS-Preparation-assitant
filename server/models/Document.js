import mongoose from "mongoose";

// Tracks a student's uploaded PDF and how far it's been processed.
// The PDF file itself is never stored anywhere (see pdfExtractionService.js,
// coming in a later step) — only this status record, plus the resulting
// text chunks, which live in Qdrant (mbbs_pdf_chunks collection), not here.
const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },

    chunkCount: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;