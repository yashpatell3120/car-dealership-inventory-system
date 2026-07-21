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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles(make);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
  `);
}
