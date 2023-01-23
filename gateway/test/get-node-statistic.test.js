import { beforeAll, expect, jest, test } from '@jest/globals';
import axios from 'axios';
import request from 'supertest';
import app from '../gateway';

describe('GET /node-statistic', () => {
  const expectedContent = [
    {
      mem_alarm: false,
      disk_free_alarm: false,
      uptime: 136296,
      proc_used: 447,
      sockets_used: 3,
    },
  ];

  beforeAll(() => {
    // since we are using axios to request data from HTTPSERV
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    const mockedResponse = {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      data: expectedContent,
    };
    axios.get = jest.fn();
    axios.get.mockResolvedValue(mockedResponse);
  });

  test('/node-statistic endpoint should be available', async () => {
    const res = await request(app).get('/node-statistic').send();
    expect(res.statusCode).toBe(200);
  });

  test('/node-statistic endpoint should respond with application/json', async () => {
    const res = await request(app).get('/node-statistic').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
  });

  test('/node-statistic endpoint should respond the content from HTTPSERV', async () => {
    const res = await request(app).get('/node-statistic').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(res.body).toEqual(expectedContent[0]);
  });
});
