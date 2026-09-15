const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('responds with a status field', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('status');
  });
});