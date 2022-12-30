import { expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../gateway';

test('GATEWAY should expose /messages endpoint', async () => {
    const res = await request(app)
        .get('/messages')
        .send();
    expect(res.statusCode).toBe(200);
});