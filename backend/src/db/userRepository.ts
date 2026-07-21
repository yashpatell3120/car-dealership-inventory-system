import { getDb } from './connection';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: string;
}

export function createUser(email: string, passwordHash: string, role: 'user' | 'admin' = 'user'): User {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
  );
  const result = stmt.run(email, passwordHash, role);
  return findUserById(Number(result.lastInsertRowid))!;
}

export function findUserByEmail(email: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}
