import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.role).toBe('user');
    // Password hash should never be returned to the client.
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('rejects registration with an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('rejects registration with a too-short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', password: '123' });

    expect(res.status).toBe(400);
  });

  it('rejects duplicate email registration', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dupe@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dupe@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('allows registering an admin user via role field', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'admin2@example.com', password: 'password123', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('admin');
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login-user@example.com', password: 'correcthorse' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login-user@example.com', password: 'correcthorse' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login-user@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'whatever123' });

    expect(res.status).toBe(401);
  });
});
