import { jest, expect, beforeAll, test } from '@jest/globals';
import axios from 'axios';
import request from 'supertest';
import app from '../gateway';

describe('/messages', () => {
  const expectedContent = `2022-11-23T14:58:40.345Z 1 MSG_1 to compse140.o\n
    2022-11-23T14:58:41.348Z 2 Got MSG_1 to compse140.i\n
    2022-11-23T14:58:43.349Z 3 MSG_2 to compse140.o\n
    2022-11-23T14:58:44.352Z 4 Got MSG_2 to compse140.i\n
    2022-11-23T14:58:46.353Z 5 MSG_3 to compse140.o\n
    2022-11-23T14:58:47.356Z 6 Got MSG_3 to compse140.i`;

  beforeAll(() => {
    // since we are using axios to request data from HTTPSERV
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    const mockedResponse = {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      data: expectedContent,
    };
    axios.get = jest.fn();
    axios.get.mockResolvedValue(mockedResponse);
  });

  test('/messages endpoint should be available', async () => {
    const res = await request(app).get('/messages').send();
    expect(res.statusCode).toBe(200);
  });

  test('/messages endpoint should respond with text/plain', async () => {
    const res = await request(app).get('/messages').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
  });

  test('/messages endpoint should respond the content from HTTPSERV', async () => {
    const res = await request(app).get('/messages').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.text).toBe(expectedContent);
  });
});
