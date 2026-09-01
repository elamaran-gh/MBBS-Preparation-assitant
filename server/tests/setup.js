import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from '../models/Question.js';
import Reference from '../models/Reference.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a dedicated test database so these tests never touch your real dev/prod data.
// Override with TEST_MONGODB_URI if you want to point at a different test instance.
const TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/mbbs-ai-study-assistant-test';

/**
 * Connects to the test database and seeds it from the real dataset files
 * (server/data/questions.json, server/data/references.json), mirroring
 * scripts/seed.js so tests exercise the same data shape as production.
 */
export const setupTestDatabase = async () => {
  await mongoose.connect(TEST_MONGODB_URI);

  await Question.deleteMany({});
  await Reference.deleteMany({});

  const questionsPath = path.join(__dirname, '../data/questions.json');
  const referencesPath = path.join(__dirname, '../data/references.json');

  const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  const referencesData = JSON.parse(fs.readFileSync(referencesPath, 'utf-8'));

  // Insert references first, build a lookup from dataset id -> Mongo _id
  const insertedReferences = await Reference.insertMany(referencesData);
  const refIdMap = new Map(insertedReferences.map((r) => [r.id, r._id]));

  const questionsToInsert = questionsData.map((q) => ({
    ...q,
    referenceIds: (q.referenceIds || [])
      .map((rid) => refIdMap.get(rid))
      .filter(Boolean),
  }));

  const insertedQuestions = await Question.insertMany(questionsToInsert);

  return {
    questionCount: insertedQuestions.length,
    referenceCount: insertedReferences.length,
  };
};

/**
 * Drops the test collections and closes the connection. Call from afterAll().
 */
export const teardownTestDatabase = async () => {
  await Question.deleteMany({});
  await Reference.deleteMany({});
  await mongoose.connection.close();
};
