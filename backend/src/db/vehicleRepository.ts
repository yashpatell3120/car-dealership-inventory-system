import { getDb } from './connection';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface NewVehicle {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function createVehicle(data: NewVehicle): Vehicle {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(data.make, data.model, data.category, data.price, data.quantity);
  return findVehicleById(Number(result.lastInsertRowid))!;
}

export function findVehicleById(id: number): Vehicle | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
  return stmt.get(id) as Vehicle | undefined;
}

export function listVehicles(): Vehicle[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC');
  return stmt.all() as unknown as Vehicle[];
}

export function searchVehicles(filters: VehicleSearchFilters): Vehicle[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters.make) {
    clauses.push('make LIKE ?');
    params.push(`%${filters.make}%`);
  }
  if (filters.model) {
    clauses.push('model LIKE ?');
    params.push(`%${filters.model}%`);
  }
  if (filters.category) {
    clauses.push('category LIKE ?');
    params.push(`%${filters.category}%`);
  }
  if (filters.minPrice !== undefined) {
    clauses.push('price >= ?');
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    clauses.push('price <= ?');
    params.push(filters.maxPrice);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const stmt = db.prepare(`SELECT * FROM vehicles ${where} ORDER BY created_at DESC`);
  return stmt.all(...params) as unknown as Vehicle[];
}

export function updateVehicle(id: number, data: Partial<NewVehicle>): Vehicle | undefined {
  const existing = findVehicleById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...data };
  const db = getDb();
  const stmt = db.prepare(
    `UPDATE vehicles
     SET make = ?, model = ?, category = ?, price = ?, quantity = ?, updated_at = datetime('now')
     WHERE id = ?`
  );
  stmt.run(merged.make, merged.model, merged.category, merged.price, merged.quantity, id);
  return findVehicleById(id);
}

export function deleteVehicle(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function adjustQuantity(id: number, delta: number): Vehicle | undefined {
  const existing = findVehicleById(id);
  if (!existing) return undefined;

  const newQuantity = existing.quantity + delta;
  if (newQuantity < 0) {
    throw new Error('INSUFFICIENT_STOCK');
  }

  const db = getDb();
  const stmt = db.prepare(
    `UPDATE vehicles SET quantity = ?, updated_at = datetime('now') WHERE id = ?`
  );
  stmt.run(newQuantity, id);
  return findVehicleById(id);
}
