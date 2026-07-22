import { getDb } from './connection';

export interface Order {
  id: number;
  user_id: number;
  vehicle_id: number;
  quantity: number;
  price_at_purchase: number;
  make: string;
  model: string;
  created_at: string;
}

export interface NewOrder {
  userId: number;
  vehicleId: number;
  quantity: number;
  priceAtPurchase: number;
  make: string;
  model: string;
}

export function createOrder(data: NewOrder): Order {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO orders (user_id, vehicle_id, quantity, price_at_purchase, make, model)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
    data.userId,
    data.vehicleId,
    data.quantity,
    data.priceAtPurchase,
    data.make,
    data.model
  );
  const findStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  return findStmt.get(Number(result.lastInsertRowid)) as unknown as Order;
}

export function listOrdersForUser(userId: number): Order[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as unknown as Order[];
}

export function listAllOrders(): Order[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
  return stmt.all() as unknown as Order[];
}
