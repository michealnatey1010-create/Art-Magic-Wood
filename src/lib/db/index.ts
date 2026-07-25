import Database from "better-sqlite3";
import * as path from "path";

const dbPath = path.resolve(process.cwd(), "database.sqlite");

const globalForDb = globalThis as unknown as { db: Database.Database };

function getDb() {
  if (globalForDb.db) return globalForDb.db;
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  globalForDb.db = db;
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      coverImage TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      image TEXT DEFAULT '',
      stage_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS teacher_packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      monthly_price REAL NOT NULL,
      quarterly_price REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teacher_features (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      package_id TEXT NOT NULL,
      FOREIGN KEY (package_id) REFERENCES teacher_packages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS preorder_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS libraries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      commission REAL DEFAULT 10,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS merchant_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      image TEXT DEFAULT '',
      sku TEXT DEFAULT '',
      vendor_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS package_proposals (
      id TEXT PRIMARY KEY,
      teacher_name TEXT NOT NULL,
      teacher_phone TEXT NOT NULL,
      teacher_email TEXT DEFAULT '',
      package_details TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      teacher_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  try { db.exec("ALTER TABLE stages ADD COLUMN coverImage TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE stages ADD COLUMN price REAL NOT NULL DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''"); } catch {}
}

export const db = getDb();
