import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Ensure the data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
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

  // Normalize existing data on initialization
  try {
    const { normalizeExistingData } = require('./normalize-data');
    normalizeExistingData();
  } catch (e) {
    // Migration is optional
  }

  console.log('Database initialized successfully');
}

export function closeDb() {
  if (db) {
    db.close();
  }
}
