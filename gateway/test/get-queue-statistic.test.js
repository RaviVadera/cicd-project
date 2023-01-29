import { beforeAll, expect, jest, test } from '@jest/globals';
import axios from 'axios';
import request from 'supertest';
import app from '../gateway';

describe('GET /queue-statistic', () => {
  const mockedContent = [
    {
      name: 'amq.gen-SmbQHWPZUSYpg85F_zR9fw',
      message_stats: {
        deliver_no_ack: 990,
        deliver_no_ack_details: {
          rate: 0.4,
        },
        publish: 990,
        publish_details: {
          rate: 0.4,
        },
      },
    },
    {
      name: 'amq.gen-pY_4YU42iSRWq0SUftG-ZA',
      message_stats: {
        deliver_no_ack: 1980,
        deliver_no_ack_details: {
          rate: 0.8,
        },
        publish: 1980,
        publish_details: {
          rate: 0.8,
        },
      },
    },
  ];

  const expectedContent = [
    {
      name: 'amq.gen-SmbQHWPZUSYpg85F_zR9fw',
      messages_delivered_recently: 990,
      messages_delivery_Rate: 0.4,
      messages_published_lately: 990,
      messages_publishing_rate: 0.4,
    },
    {
      name: 'amq.gen-pY_4YU42iSRWq0SUftG-ZA',
      messages_delivered_recently: 1980,
      messages_delivery_Rate: 0.8,
      messages_published_lately: 1980,
      messages_publishing_rate: 0.8,
    },
  ];

  beforeAll(() => {
    // since we are using axios to request data from HTTPSERV
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    const mockedResponse = {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      data: mockedContent,
    };
    axios.get = jest.fn();
    axios.get.mockResolvedValue(mockedResponse);
  });

  test('/queue-statistic endpoint should be available', async () => {
    const res = await request(app).get('/queue-statistic').send();
    expect(res.statusCode).toBe(200);
  });

  test('/queue-statistic endpoint should respond with application/json', async () => {
    const res = await request(app).get('/queue-statistic').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
  });

  test('/queue-statistic endpoint should respond the content from rabbitmq', async () => {
    const res = await request(app).get('/queue-statistic').send();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('content-type');
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(res.body).toEqual(expectedContent);
  });
});
