import { expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../gateway';

describe('/messages', () => {
    test('GATEWAY should expose /messages endpoint', async () => {
        const res = await request(app)
            .get('/messages')
            .send();
        expect(res.statusCode).toBe(200);
    });

    test('GATEWAY /messages endpoint should respond with text/plain', async () => {
        const res = await request(app)
            .get('/messages')
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.headers).toHaveProperty('content-type');
        expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    });
});