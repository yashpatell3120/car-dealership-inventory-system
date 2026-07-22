import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// NOTE: We use Node's built-in `node:sqlite` module (stable in Node 22+) instead of a
// third-party native binding like better-sqlite3. This keeps the project dependency-free
// for the database layer while still giving us a real, file-backed, persistent SQLite
// database (an in-memory-only store would not satisfy the requirement).

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'dealership.sqlite');

function ensureDataDir(dbPath: string) {
  if (dbPath === ':memory:') return;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  ensureDataDir(DB_PATH);
  dbInstance = new DatabaseSync(DB_PATH);
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  runMigrations(dbInstance);
  return dbInstance;
}

export function resetDb(): void {
  // Used by tests to get a clean slate between suites.
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

function runMigrations(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Older databases created before image_url existed won't have the column yet.
  // Add it defensively; SQLite has no "ADD COLUMN IF NOT EXISTS", so we check first.
  const vehicleColumns = db.prepare("PRAGMA table_info(vehicles)").all() as { name: string }[];
  if (!vehicleColumns.some((col) => col.name === 'image_url')) {
    db.exec('ALTER TABLE vehicles ADD COLUMN image_url TEXT;');
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles(make);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
  `);

  // Order history: one row per purchase, capturing the price at time of sale so
  // historical orders remain accurate even if a vehicle's price changes later.
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      price_at_purchase REAL NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  `);
}
