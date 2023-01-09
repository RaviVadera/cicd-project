import { expect, beforeEach, afterEach, test } from '@jest/globals';
import request from 'supertest';
import app from '../gateway';
import { State } from '../state-manager';
import mock from 'mock-fs';

describe('GET /state', () => {
  const expectedContent = State.RUNNING;

  beforeEach(() => {
    mock({
      '/logs/state.current': Buffer.from(State.RUNNING),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('/state endpoint should be available', async () => {
    const res = await request(app).get('/state').send();
    expect(res.statusCode).toBe(200);
  });

  test('/state endpoint should respond with text/plain', async () => {
    const res = await request(app).get('/state').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
  });

  test('/state endpoint should respond with state', async () => {
    const res = await request(app).get('/state').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.text).toBe(expectedContent);
    const knownStates = Object.values(State);
    expect(knownStates.includes(res.text));
  });
});
