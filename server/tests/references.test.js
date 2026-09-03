import request from 'supertest';
import app from '../app.js';
import Reference from '../models/Reference.js';
import { setupTestDatabase, teardownTestDatabase } from './setup.js';

beforeAll(async () => {
  await setupTestDatabase();
}, 30000);

afterAll(async () => {
  await teardownTestDatabase();
});

describe('GET /api/references/:id', () => {
  it('returns full reference detail for a valid id', async () => {
    const anyReference = await Reference.findOne();
    const res = await request(app).get(`/api/references/${anyReference._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBeTruthy();
    expect(res.body.data.bookName).toBeTruthy();
  });

  it('returns 404 for a well-formed but nonexistent id', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/references/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
