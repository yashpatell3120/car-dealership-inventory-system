import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

let token: string;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'sorter@example.com', password: 'password123' });
  token = res.body.token;

  const seedData = [
    { make: 'Zeta', model: 'Alpha', category: 'Sedan', price: 50000, quantity: 1 },
    { make: 'Alpha', model: 'Zeta', category: 'Sedan', price: 10000, quantity: 9 },
    { make: 'Beta', model: 'Beta', category: 'Sedan', price: 30000, quantity: 5 },
  ];

  for (const v of seedData) {
    await request(app).post('/api/vehicles').set('Authorization', `Bearer ${token}`).send(v);
  }
});

describe('GET /api/vehicles with sorting', () => {
  it('sorts by price ascending', async () => {
    const res = await request(app)
      .get('/api/vehicles?sortBy=price&sortOrder=asc')
      .set('Authorization', `Bearer ${token}`);

    const prices = res.body.vehicles.map((v: any) => v.price);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it('sorts by price descending', async () => {
    const res = await request(app)
      .get('/api/vehicles?sortBy=price&sortOrder=desc')
      .set('Authorization', `Bearer ${token}`);

    const prices = res.body.vehicles.map((v: any) => v.price);
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  it('sorts by make alphabetically', async () => {
    const res = await request(app)
      .get('/api/vehicles?sortBy=make&sortOrder=asc')
      .set('Authorization', `Bearer ${token}`);

    const makes = res.body.vehicles.map((v: any) => v.make);
    const sorted = [...makes].sort();
    expect(makes).toEqual(sorted);
  });

  it('ignores an invalid sortBy value and falls back to default sort', async () => {
    const res = await request(app)
      .get('/api/vehicles?sortBy=totally-invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });

  it('applies sorting to search results too', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=Sedan&sortBy=quantity&sortOrder=desc')
      .set('Authorization', `Bearer ${token}`);

    const quantities = res.body.vehicles.map((v: any) => v.quantity);
    const sorted = [...quantities].sort((a, b) => b - a);
    expect(quantities).toEqual(sorted);
  });
});
