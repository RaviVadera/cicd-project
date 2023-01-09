import { expect, beforeEach, afterEach, test } from '@jest/globals';
import request from 'supertest';
import app from '../gateway';
import { State } from '../state-manager';
import mock from 'mock-fs';

// workaround required for an issue in iconv-lite package
// used by boyd-parser package, used by express internally
// see my findings at
// https://github.com/ashtuchkin/iconv-lite/issues/118#issuecomment-1374879755
import iconv from 'iconv-lite';
iconv.encode("", "utf8");

describe('PUT /state', () => {
  const expectedContent = State.RUNNING;
  
  beforeEach(() => {
    mock({
      '/logs/state.current': Buffer.from(State.SHUTDOWN),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('/state endpoint should be available', async () => {
    const res = await request(app)
      .put('/state')
      .type('text')
      .send(State.RUNNING);
    expect(res.statusCode).toBe(200);
  });

  test('/state endpoint should respond with text/plain', async () => {
    const res = await request(app)
      .put('/state')
      .type('text')
      .send(expectedContent);
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
  });

  test('/state endpoint should respond with new state', async () => {
    const knownStates = Object.values(State);

    const shutdownRes = await request(app).get('/state').send();
    expect(shutdownRes.statusCode).toBe(200);
    expect(shutdownRes.headers).toHaveProperty('content-type');
    expect(shutdownRes.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(shutdownRes.text).toBe(State.SHUTDOWN);
    expect(knownStates.includes(shutdownRes.text));

    const res = await request(app)
      .put('/state')
      .type('text')
      .send(State.RUNNING);
    expect(res.statusCode).toBe(200);

    const runningRes = await request(app).get('/state').send();
    expect(runningRes.statusCode).toBe(200);
    expect(runningRes.headers).toHaveProperty('content-type');
    expect(runningRes.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(runningRes.text).toBe(State.RUNNING);
    expect(knownStates.includes(runningRes.text));
  });
});
