import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'buyer@example.com', password: 'password123' });
  userToken = userRes.body.token;

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'orders-admin@example.com', password: 'password123', role: 'admin' });
  adminToken = adminRes.body.token;
});

describe('GET /api/orders', () => {
  it('starts empty for a new user', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toEqual([]);
  });

  it('records an order after a purchase', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Porsche', model: '911', category: 'Sports', price: 101000, quantity: 3 });

    const vehicleId = createRes.body.vehicle.id;

    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 2 });

    const ordersRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(ordersRes.status).toBe(200);
    expect(ordersRes.body.orders.length).toBe(1);
    expect(ordersRes.body.orders[0]).toMatchObject({
      make: 'Porsche',
      model: '911',
      quantity: 2,
      price_at_purchase: 101000,
    });
  });

  it('does not leak one user\'s orders to another user', async () => {
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'other-buyer@example.com', password: 'password123' });
    const otherToken = otherUserRes.body.token;

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toEqual([]);
  });

  it('lets an admin see all orders with ?all=true', async () => {
    const res = await request(app)
      .get('/api/orders?all=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  it('ignores ?all=true for a non-admin user (only returns their own orders)', async () => {
    const res = await request(app)
      .get('/api/orders?all=true')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.orders.every((o: any) => o.make === 'Porsche')).toBe(true);
  });
});
