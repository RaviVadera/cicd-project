import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import axios from 'axios';
import mock from 'mock-fs';
import request from 'supertest';
import app from '../gateway';
import { State, StateManager } from '../state-manager';

// workaround required for an issue in iconv-lite package
// used by boyd-parser package, used by express internally
// see my findings at
// https://github.com/ashtuchkin/iconv-lite/issues/118#issuecomment-1374879755
import iconv from 'iconv-lite';
iconv.encode("", "utf8");

describe('PUT /state', () => {
  beforeAll(() => {
    // since we are using axios to request data
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

  test('/state endpoint should respond with HTTP 400 if new state is null', async () => {
    const res = await request(app)
      .put('/state')
      .type('text')
      .send();
    expect(res.statusCode).toBe(400);
  });

  test('/state endpoint should respond with HTTP 400 if new state is invalid', async () => {
    const res = await request(app)
      .put('/state')
      .type('text')
      .send('test');
    expect(res.statusCode).toBe(400);
  });

  test('/state endpoint should respond with HTTP 500 in case of unexpected error', async () => {
    StateManager.setState = jest.fn(() => {
      throw new Error('Mocked Error');
    });
    const res = await request(app)
      .put('/state')
      .type('text')
      .send(State.PAUSED);
    expect(res.statusCode).toBe(500);
  });
});
