import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const dbPath = path.resolve(process.cwd(), 'data', 'app.db');

// Ensure the data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Use global variable to prevent multiple instances in dev (hot reload safe)
declare global {
  var __db: Database.Database | undefined;
}

let db: Database.Database;

export function getDb(): Database.Database {
  if (!global.__db) {
    global.__db = new Database(dbPath);
    global.__db.pragma('journal_mode = WAL');
  }
  db = global.__db;
  return db;
}

export function initializeDatabase() {
  const database = getDb();

  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create consumers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS consumers (
      id TEXT PRIMARY KEY,
      accNo TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      guardian TEXT,
      meterNo TEXT,
      mobile TEXT,
      address TEXT,
      tarrif TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create letter_activities table
  database.exec(`
    CREATE TABLE IF NOT EXISTS letter_activities (
      id TEXT PRIMARY KEY,
      accountNumber TEXT NOT NULL,
      consumerName TEXT NOT NULL,
      subject TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      date TEXT NOT NULL,
      letterType TEXT,
      formData TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Optional: Normalize existing data
  import('./normalize-data')
    .then(({ normalizeExistingData }) => normalizeExistingData())
    .catch(() => {
      console.warn('Data normalization skipped');
    });

  console.log('Database initialized successfully');
}

export function closeDb() {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}
