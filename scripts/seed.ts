import bcryptjs from "bcryptjs";
import Database from "better-sqlite3";
import * as path from "path";

const dbPath = path.resolve(process.cwd(), "database.sqlite");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT DEFAULT '',
    stage_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS teacher_packages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    monthly_price REAL NOT NULL,
    quarterly_price REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS teacher_features (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    text TEXT NOT NULL,
    package_id TEXT NOT NULL,
    FOREIGN KEY (package_id) REFERENCES teacher_packages(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS preorder_products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS libraries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    commission REAL DEFAULT 10,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

const existing = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@school.com");
if (!existing) {
  const hashed = bcryptjs.hashSync("123456", 12);
  db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run("المشرف العام", "admin@school.com", hashed);
  console.log("✅ Admin user created: admin@school.com / 123456");
} else {
  console.log("ℹ️  Admin user already exists.");
}

db.close();
