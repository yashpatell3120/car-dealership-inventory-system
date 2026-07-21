import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'shopper@example.com', password: 'password123' });
  userToken = userRes.body.token;

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'manager@example.com', password: 'password123', role: 'admin' });
  adminToken = adminRes.body.token;
});

describe('Vehicle route authentication', () => {
  it('rejects unauthenticated requests to list vehicles', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('rejects requests with a malformed token', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/vehicles', () => {
  it('allows an authenticated user to add a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body.vehicle.id).toBeDefined();
    expect(res.body.vehicle.make).toBe('Toyota');
    expect(res.body.vehicle.quantity).toBe(5);
  });

  it('rejects a vehicle with missing required fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota' });

    expect(res.status).toBe(400);
  });

  it('rejects a negative price', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Yaris', category: 'Sedan', price: -100, quantity: 1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/vehicles', () => {
  it('returns a list of vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
    expect(res.body.vehicles.length).toBeGreaterThan(0);
  });
});

describe('GET /api/vehicles/search', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 24500, quantity: 3 });

    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Honda', model: 'CR-V', category: 'SUV', price: 31000, quantity: 2 });
  });

  it('filters by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Honda')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicles.every((v: any) => v.make === 'Honda')).toBe(true);
  });

  it('filters by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicles.every((v: any) => v.category === 'SUV')).toBe(true);
  });

  it('filters by price range', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=25000&maxPrice=35000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.vehicles.every((v: any) => v.price >= 25000 && v.price <= 35000)
    ).toBe(true);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('updates a vehicle', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Ford', model: 'Focus', category: 'Sedan', price: 20000, quantity: 4 });

    const id = createRes.body.vehicle.id;

    const updateRes = await request(app)
      .put(`/api/vehicles/${id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 19500 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.vehicle.price).toBe(19500);
    // Untouched fields should remain the same.
    expect(updateRes.body.vehicle.make).toBe('Ford');
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/999999')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 100 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  it('rejects deletion from a non-admin user', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Nissan', model: 'Altima', category: 'Sedan', price: 23000, quantity: 2 });

    const id = createRes.body.vehicle.id;

    const res = await request(app)
      .delete(`/api/vehicles/${id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('allows an admin to delete a vehicle', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Kia', model: 'Sportage', category: 'SUV', price: 27000, quantity: 1 });

    const id = createRes.body.vehicle.id;

    const res = await request(app)
      .delete(`/api/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get('/api/vehicles/search?make=Kia')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.body.vehicles.find((v: any) => v.id === id)).toBeUndefined();
  });
});

describe('POST /api/vehicles/:id/purchase', () => {
  it('decreases quantity by 1 by default', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Subaru', model: 'Outback', category: 'SUV', price: 30000, quantity: 3 });

    const id = createRes.body.vehicle.id;

    const purchaseRes = await request(app)
      .post(`/api/vehicles/${id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(purchaseRes.status).toBe(200);
    expect(purchaseRes.body.vehicle.quantity).toBe(2);
  });

  it('rejects a purchase that would drive quantity negative', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Mini', model: 'Cooper', category: 'Hatchback', price: 26000, quantity: 1 });

    const id = createRes.body.vehicle.id;

    const res = await request(app)
      .post(`/api/vehicles/${id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(400);
  });

  it('returns 404 when purchasing a non-existent vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/999999/purchase')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.status).toBe(404);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  it('rejects restock from a non-admin user', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Jeep', model: 'Wrangler', category: 'SUV', price: 35000, quantity: 2 });

    const id = createRes.body.vehicle.id;

    const res = await request(app)
      .post(`/api/vehicles/${id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(403);
  });

  it('allows an admin to restock a vehicle', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Volvo', model: 'XC60', category: 'SUV', price: 44000, quantity: 1 });

    const id = createRes.body.vehicle.id;

    const res = await request(app)
      .post(`/api/vehicles/${id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 4 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(5);
  });
});
