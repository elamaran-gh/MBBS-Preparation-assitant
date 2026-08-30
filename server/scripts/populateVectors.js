import "dotenv/config";
import mongoose from "mongoose";

import Question from "../models/Question.js";
import vectorService from "../services/vectorService.js";
import embeddingService from "../services/embeddingService.js";
import vectorDbConfig from "../config/vectorDb.js";

async function populateVectors() {
  try {
    // ------------------------------------------
    // 1. Check MongoDB URI
    // ------------------------------------------

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is missing from your environment variables."
      );
    }

    // ------------------------------------------
    // 2. Connect to MongoDB
    // ------------------------------------------

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected.");

    // ------------------------------------------
    // 3. Warn if Qdrant isn't configured
    // ------------------------------------------

    if (!vectorDbConfig.isConfigured) {
      console.log(
        "\nINFO: Qdrant credentials are not set (QDRANT_URL / QDRANT_API_KEY)."
      );
      console.log(
        "This script will still run end-to-end, but vectorService.upsertDocument()"
      );
      console.log(
        "will no-op for each question instead of writing to Qdrant.\n"
      );
    }

    // ------------------------------------------
    // 4. Ensure the Qdrant collection exists
    // ------------------------------------------

    console.log("Ensuring Qdrant collection exists...");

    await vectorService.initCollection();

    // ------------------------------------------
    // 5. Load all questions from MongoDB
    // ------------------------------------------

    console.log("Loading questions from MongoDB...");

    const questions = await Question.find();

    console.log(`Questions loaded: ${questions.length}`);

    if (questions.length === 0) {
      console.log(
        "No questions found. Run `npm run seed` first, then re-run this script."
      );
      return;
    }

    // ------------------------------------------
    // 6. Embed and upsert each question
    // ------------------------------------------

    console.log("Generating embeddings and upserting to Qdrant...\n");

    let upserted = 0;
    let failed = 0;

    for (const [index, question] of questions.entries()) {
      // Combine questionText with topic/chapter for a richer embedding signal,
      // matching the weighting used in the MongoDB text index (models/Question.js).
      const embeddingInput = [
        question.questionText,
        question.topic,
        question.chapter
      ]
        .filter(Boolean)
        .join(" ");

      try {
        const vector = await embeddingService.generateEmbedding(embeddingInput);

        const success = await vectorService.upsertDocument(
          question._id.toString(),
          vector,
          {
            questionId: question.id,
            questionText: question.questionText,
            subject: question.subject,
            university: question.university,
            year: question.year,
            chapter: question.chapter,
            topic: question.topic,
            questionType: question.questionType
          }
        );

        if (success) {
          upserted += 1;
          console.log(
            `[${index + 1}/${questions.length}] Upserted: ${question.id}`
          );
        } else {
          failed += 1;
          console.log(
            `[${index + 1}/${questions.length}] Upsert returned false: ${question.id}`
          );
        }
      } catch (error) {
        failed += 1;
        console.error(
          `[${index + 1}/${questions.length}] Failed: ${question.id} — ${error.message}`
        );
      }
    }

    // ------------------------------------------
    // 7. Display statistics
    // ------------------------------------------

    console.log("\n================================");
    console.log("VECTOR POPULATION COMPLETED");
    console.log("================================");
    console.log(`Total questions processed: ${questions.length}`);
    console.log(`Successfully upserted: ${upserted}`);
    console.log(`Failed: ${failed}`);
    console.log(
      `Qdrant status: ${
        vectorDbConfig.isConfigured ? "live (points written)" : "not configured (no-op)"
      }`
    );
    console.log("================================\n");
  } catch (error) {
    console.error("\n❌ Vector population failed.");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }
  }
}

populateVectors();