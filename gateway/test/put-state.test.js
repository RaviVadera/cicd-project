import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import axios from 'axios';
import mock from 'mock-fs';
import request from 'supertest';
import app from '../gateway';
import { State } from '../state-manager';

// workaround required for an issue in iconv-lite package
// used by boyd-parser package, used by express internally
// see my findings at
// https://github.com/ashtuchkin/iconv-lite/issues/118#issuecomment-1374879755
import iconv from 'iconv-lite';
iconv.encode("", "utf8");

describe('PUT /state', () => {
  beforeAll(() => {
    // since we are using axios to request data from HTTPSERV
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    const mockedResponse = {
      status: 204,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    };
    axios.post = jest.fn();
    axios.post.mockResolvedValue(mockedResponse);
  });
  
  beforeEach(() => {
    mock({
      '/logs/state.current': Buffer.from(State.RUNNING),
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
      .send(State.RUNNING);
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
    expect(shutdownRes.text).toBe(State.RUNNING);
    expect(knownStates.includes(shutdownRes.text));

    const res = await request(app)
      .put('/state')
      .type('text')
      .send(State.PAUSED);
    expect(res.statusCode).toBe(200);

    const runningRes = await request(app).get('/state').send();
    expect(runningRes.statusCode).toBe(200);
    expect(runningRes.headers).toHaveProperty('content-type');
    expect(runningRes.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(runningRes.text).toBe(State.PAUSED);
    expect(knownStates.includes(runningRes.text));
  });
});
