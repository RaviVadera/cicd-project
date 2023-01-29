import { expect, jest, test } from '@jest/globals';
import mock from 'mock-fs';
import request from 'supertest';
import app from '../gateway';
import { State, StateManager } from '../state-manager';

describe('GET /statistic', () => {
  beforeEach(() => {
    mock({
      '/logs/state.current': Buffer.from(State.RUNNING),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('/statistic endpoint should be available', async () => {
    const res = await request(app).get('/statistic').send();
    expect(res.statusCode).toBe(200);
  });

  test('/statistic endpoint should respond with text/html', async () => {
    const res = await request(app).get('/statistic').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
  });

  test('/statistic endpoint should respond with HTTP 500 in case of unexpected error', async () => {
    StateManager.getState = jest.fn(() => {
      throw new Error('Mocked Error');
    });
    const res = await request(app).get('/statistic').send();
    expect(res.statusCode).toBe(500);
  });
});
