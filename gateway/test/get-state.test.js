import { jest, expect, beforeAll, test } from '@jest/globals';
import request from 'supertest';
import app from '../gateway';
import { State, StateManager } from '../state-manager';

describe('/state', () => {
  const expectedContent = State.RUNNING;

  beforeAll(() => {
    StateManager.getState = jest.fn();
    StateManager.getState.mockReturnValue(expectedContent);
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
