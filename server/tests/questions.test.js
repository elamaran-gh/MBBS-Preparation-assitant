import request from 'supertest';
import app from '../app.js';
import Question from '../models/Question.js';
import { setupTestDatabase, teardownTestDatabase } from './setup.js';

let seedInfo;

beforeAll(async () => {
  seedInfo = await setupTestDatabase();
}, 30000);

afterAll(async () => {
  await teardownTestDatabase();
});

describe('GET /api/health', () => {
  it('returns a healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
  });
});

describe('GET /api/questions', () => {
  it('returns the full seeded question count and filter lists', async () => {
    const res = await request(app).get('/api/questions').query({ limit: 100 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(seedInfo.questionCount);
    expect(res.body.filters.subjects).toEqual(
      expect.arrayContaining(['Medicine', 'Surgery', 'Pathology', 'Pharmacology', 'Microbiology'])
    );
    expect(res.body.filters.universities).toEqual(
      expect.arrayContaining([
        'RGUHS',
        'Pandit Bhagwat Dayal Sharma University of Health Sciences (Rohtak)',
      ])
    );
  });

  it('filters by subject', async () => {
    const res = await request(app).get('/api/questions').query({ subject: 'Microbiology' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((q) => expect(q.subject).toBe('Microbiology'));
  });

  it('filters by university', async () => {
    const res = await request(app)
      .get('/api/questions')
      .query({ university: 'Pandit Bhagwat Dayal Sharma University of Health Sciences (Rohtak)' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((q) =>
      expect(q.university).toBe('Pandit Bhagwat Dayal Sharma University of Health Sciences (Rohtak)')
    );
  });

  it('respects pagination limits', async () => {
    const res = await request(app).get('/api/questions').query({ limit: 5, page: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });
});

describe('GET /api/questions/search', () => {
  it('finds a question via full-text match on a known topic', async () => {
    const res = await request(app).get('/api/questions/search').query({ q: 'nephrotic' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
    expect(
      res.body.data.some((q) => /nephrotic/i.test(q.questionText) || /nephrotic/i.test(q.topic))
    ).toBe(true);
  });

  it('falls back to regex search for partial/odd queries the text index misses', async () => {
    // A short, partial fragment unlikely to be tokenized favorably by $text
    const res = await request(app).get('/api/questions/search').query({ q: 'gangren' });

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('combines a search term with a filter', async () => {
    const res = await request(app)
      .get('/api/questions/search')
      .query({ q: 'poisoning', subject: 'Pharmacology' });

    expect(res.status).toBe(200);
    res.body.data.forEach((q) => expect(q.subject).toBe('Pharmacology'));
  });

  it('returns filtered results with no query term at all', async () => {
    const res = await request(app).get('/api/questions/search').query({ subject: 'Surgery' });
    expect(res.status).toBe(200);
    res.body.data.forEach((q) => expect(q.subject).toBe('Surgery'));
  });
});

describe('GET /api/questions/:id', () => {
  it('returns full detail with populated references for a valid id', async () => {
    const anyQuestion = await Question.findOne();
    const res = await request(app).get(`/api/questions/${anyQuestion._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(anyQuestion._id.toString());
    expect(res.body.data.questionText).toBeTruthy();
  });

  it('returns 404 for a well-formed but nonexistent id', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/questions/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/questions/:id/similar', () => {
  it('returns similar questions without erroring, excluding the source question', async () => {
    const anyQuestion = await Question.findOne();
    const res = await request(app).get(`/api/questions/${anyQuestion._id}/similar`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((item) => {
      expect(item.question._id).not.toBe(anyQuestion._id.toString());
      expect(typeof item.similarityScore).toBe('number');
    });
  }, 20000);
});
