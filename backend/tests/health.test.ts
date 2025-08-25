import request from 'supertest';
import { createApp } from '../src/main';

describe('health endpoints', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /health -> 200 {ok:true}', async () => {
    const res = await request(app.getHttpAdapter().getInstance()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /ready -> 200 {ready:true}', async () => {
    const res = await request(app.getHttpAdapter().getInstance()).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ready: true });
  });
});
