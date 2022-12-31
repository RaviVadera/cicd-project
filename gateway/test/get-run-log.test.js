import { expect, beforeEach, afterEach, test } from '@jest/globals';
import request from 'supertest';
import app from '../gateway';
import { State } from '../state-manager';
import mock from 'mock-fs';

describe('/run-log', () => {
  const expectedContent = `2022-11-23T14:58:40.345Z: INIT\n
    2022-11-23T14:58:41.348Z: RUNNING\n
    2022-11-23T14:58:43.349Z: PAUSED\n
    2022-11-23T14:58:44.352Z: RUNNING\n
    2022-11-23T14:58:46.353Z: SHUTDOWN\n
    2022-11-23T14:58:47.356Z: INIT`;

  beforeEach(() => {
    mock({
      '/logs/state.log': Buffer.from(State.RUNNING),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('/run-log endpoint should be available', async () => {
    const res = await request(app).get('/run-log').send();
    expect(res.statusCode).toBe(200);
  });

  test('/run-log endpoint should respond with text/plain', async () => {
    const res = await request(app).get('/run-log').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
  });

  test('/run-log endpoint should respond with state', async () => {
    const res = await request(app).get('/run-log').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.text).toBe(expectedContent);
  });
});
