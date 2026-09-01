import request from 'supertest';
import app from '../app.js';
import Question from '../models/Question.js';
import { setupTestDatabase, teardownTestDatabase } from './setup.js';

beforeAll(async () => {
  await setupTestDatabase();
}, 30000);

afterAll(async () => {
  await teardownTestDatabase();
});

describe('POST /api/ai/answer', () => {
  it('generates a structured answer from a questionId', async () => {
    const anyQuestion = await Question.findOne();

    const res = await request(app)
      .post('/api/ai/answer')
      .send({ questionId: anyQuestion._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeTruthy();
  }, 30000);

  it('generates a structured answer from free-text questionText', async () => {
    const res = await request(app)
      .post('/api/ai/answer')
      .send({ questionText: 'What is the pathophysiology of nephrotic syndrome?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeTruthy();
  }, 30000);

  it('returns 404 for a nonexistent questionId', async () => {
    const fakeId = '64b64b64b64b64b64b64b64';
    const res = await request(app).post('/api/ai/answer').send({ questionId: fakeId });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when neither questionId nor questionText is provided', async () => {
    const res = await request(app).post('/api/ai/answer').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
