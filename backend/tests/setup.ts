import fs from 'fs';
import path from 'path';

// Use an isolated, throwaway SQLite file per test worker so test runs never
// touch the real development database and each run starts from a clean slate.
const testDbPath = path.join(__dirname, `test-${process.pid}.sqlite`);
process.env.DB_PATH = testDbPath;
process.env.JWT_SECRET = 'test-secret';

afterAll(() => {
  const { resetDb } = require('../src/db/connection');
  resetDb();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});
