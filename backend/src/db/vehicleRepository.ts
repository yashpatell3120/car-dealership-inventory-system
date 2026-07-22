import { getDb } from './connection';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewVehicle {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

export type SortField = 'price' | 'created_at' | 'make' | 'quantity';
export type SortOrder = 'asc' | 'desc';

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

const ALLOWED_SORT_FIELDS: SortField[] = ['price', 'created_at', 'make', 'quantity'];

function buildOrderClause(sortBy?: SortField, sortOrder?: SortOrder): string {
  const field = sortBy && ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
  return `ORDER BY ${field} ${order}`;
}

export function createVehicle(data: NewVehicle): Vehicle {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO vehicles (make, model, category, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    data.make,
    data.model,
    data.category,
    data.price,
    data.quantity,
    data.image_url ?? null
  );
  return findVehicleById(Number(result.lastInsertRowid))!;
}

export function findVehicleById(id: number): Vehicle | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
  return stmt.get(id) as Vehicle | undefined;
}

export function listVehicles(sortBy?: SortField, sortOrder?: SortOrder): Vehicle[] {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM vehicles ${buildOrderClause(sortBy, sortOrder)}`);
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
  const orderClause = buildOrderClause(filters.sortBy, filters.sortOrder);
  const stmt = db.prepare(`SELECT * FROM vehicles ${where} ${orderClause}`);
  return stmt.all(...params) as unknown as Vehicle[];
}

export function updateVehicle(id: number, data: Partial<NewVehicle>): Vehicle | undefined {
  const existing = findVehicleById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...data };
  const db = getDb();
  const stmt = db.prepare(
    `UPDATE vehicles
     SET make = ?, model = ?, category = ?, price = ?, quantity = ?, image_url = ?, updated_at = datetime('now')
     WHERE id = ?`
  );
  stmt.run(
    merged.make,
    merged.model,
    merged.category,
    merged.price,
    merged.quantity,
    merged.image_url ?? null,
    id
  );
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
