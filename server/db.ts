import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // Vercel Serverless: use /tmp for writable storage
  // Local dev: use ./data directory
  const isVercel = !!process.env.VERCEL;
  const dataDir = isVercel ? '/tmp' : path.resolve('data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'molbreeding.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}
