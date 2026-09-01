import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import app from '../app.js';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_PDF = path.join(__dirname, 'fixtures/sample.pdf');

const TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/mbbs-ai-study-assistant-test';

beforeAll(async () => {
  await mongoose.connect(TEST_MONGODB_URI);
  await Document.deleteMany({});
}, 30000);

afterAll(async () => {
  await Document.deleteMany({});
  await mongoose.connection.close();
});

describe('POST /api/documents/upload', () => {
  it('rejects a request with no file', async () => {
    const res = await request(app).post('/api/documents/upload');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('accepts a PDF, extracts text, and reports it ready with chunks', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .attach('pdf', SAMPLE_PDF);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ready');
    expect(res.body.data.chunkCount).toBeGreaterThan(0);
    expect(res.body.data.documentId).toBeTruthy();
  }, 60000);
});

describe('GET /api/documents/:id and POST /api/documents/:id/ask', () => {
  let documentId;

  beforeAll(async () => {
    const uploadRes = await request(app).post('/api/documents/upload').attach('pdf', SAMPLE_PDF);
    documentId = uploadRes.body.data.documentId;
  }, 60000);

  it('reports the processing status of an uploaded document', async () => {
    const res = await request(app).get(`/api/documents/${documentId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ready');
  });

  it('returns 404 for a nonexistent document id', async () => {
    const fakeId = '64b64b64b64b64b64b64b64';
    const res = await request(app).get(`/api/documents/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('answers a question grounded in the uploaded document', async () => {
    const res = await request(app)
      .post(`/api/documents/${documentId}/ask`)
      .send({ questionText: 'What are the common causes of this condition?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeTruthy();
  }, 30000);

  it('rejects an ask request with no questionText', async () => {
    const res = await request(app).post(`/api/documents/${documentId}/ask`).send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
