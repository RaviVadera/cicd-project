import { expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../gateway';

describe('GET /statistic', () => {
  test('/statistic endpoint should be available', async () => {
    const res = await request(app).get('/statistic').send();
    expect(res.statusCode).toBe(200);
  });

  test('/statistic endpoint should respond with application/html', async () => {
    const res = await request(app).get('/statistic').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('application/html; charset=utf-8');
  });
});
