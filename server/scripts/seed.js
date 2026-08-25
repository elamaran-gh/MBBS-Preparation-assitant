import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Question from "../models/Question.js";
import Reference from "../models/Reference.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../data");

const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const REFERENCES_FILE = path.join(DATA_DIR, "references.json");

async function loadJson(filePath) {
  const file = await fs.readFile(filePath, "utf-8");
  return JSON.parse(file);
}

async function seedDatabase() {
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
    // 2. Load datasets
    // ------------------------------------------

    console.log("Loading datasets...");

    const questions = await loadJson(QUESTIONS_FILE);
    const references = await loadJson(REFERENCES_FILE);

    console.log(`Questions loaded: ${questions.length}`);
    console.log(`References loaded: ${references.length}`);

    // ------------------------------------------
    // 3. Validate datasets
    // ------------------------------------------

    for (const question of questions) {
      if (!question.id) {
        throw new Error("Question is missing id.");
      }

      if (!question.questionText) {
        throw new Error(
          `Question ${question.id} is missing questionText.`
        );
      }

      if (!question.subject) {
        throw new Error(
          `Question ${question.id} is missing subject.`
        );
      }
    }

    for (const reference of references) {
      if (!reference.id) {
        throw new Error("Reference is missing id.");
      }

      if (!reference.content) {
        throw new Error(
          `Reference ${reference.id} is missing content.`
        );
      }
    }

    console.log("Dataset validation passed.");

    // ------------------------------------------
    // 4. Connect to MongoDB
    // ------------------------------------------

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected.");

    // ------------------------------------------
    // 5. Clear existing prototype data
    // ------------------------------------------

    console.log("Clearing existing prototype data...");

    await Question.deleteMany({});
    await Reference.deleteMany({});

    console.log("Existing data cleared.");

    // ------------------------------------------
    // 6. Insert references first
    // ------------------------------------------

    console.log("Inserting references...");

    const insertedReferences = await Reference.insertMany(
      references
    );

    console.log(
      `Inserted ${insertedReferences.length} references.`
    );

    // ------------------------------------------
    // 7. Create reference ID → MongoDB ObjectId map
    // ------------------------------------------

    const referenceMap = new Map(
      insertedReferences.map((reference) => [
        reference.id,
        reference._id,
      ])
    );

    // ------------------------------------------
    // 8. Validate question references
    // ------------------------------------------

    for (const question of questions) {
      if (!Array.isArray(question.referenceIds)) {
        continue;
      }

      for (const referenceId of question.referenceIds) {
        if (!referenceMap.has(referenceId)) {
          throw new Error(
            `Question ${question.id} references missing reference: ${referenceId}`
          );
        }
      }
    }

    console.log(
      "Question-reference relationships validated."
    );

    // ------------------------------------------
    // 9. Convert reference string IDs → ObjectIds
    // ------------------------------------------

    const questionsToInsert = questions.map((question) => ({
      ...question,

      referenceIds: (question.referenceIds || []).map(
        (referenceId) => referenceMap.get(referenceId)
      ),
    }));

    // ------------------------------------------
    // 10. Insert questions
    // ------------------------------------------

    console.log("Inserting questions...");

    const insertedQuestions = await Question.insertMany(
      questionsToInsert
    );

    console.log(
      `Inserted ${insertedQuestions.length} questions.`
    );

    // ------------------------------------------
    // 11. Display statistics
    // ------------------------------------------

    const subjectCounts = {};

    for (const question of questions) {
      subjectCounts[question.subject] =
        (subjectCounts[question.subject] || 0) + 1;
    }

    console.log("\n================================");
    console.log("DATABASE SEED COMPLETED");
    console.log("================================");

    console.log(
      `Total questions: ${insertedQuestions.length}`
    );

    console.log(
      `Total references: ${insertedReferences.length}`
    );

    console.log("\nQuestions by subject:");

    for (const [subject, count] of Object.entries(
      subjectCounts
    )) {
      console.log(`- ${subject}: ${count}`);
    }

    console.log("================================\n");

  } catch (error) {
    console.error("\n❌ Database seed failed.");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }
  }
}

seedDatabase();