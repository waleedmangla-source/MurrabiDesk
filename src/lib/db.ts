import Database from 'better-sqlite3';
import path from 'path';

declare global {
  var _sqliteCache: Database.Database | undefined;
}

export function getDb() {
  if (!global._sqliteCache) {
    const dbPath = path.join(process.cwd(), 'murrabi-db.sqlite');
    const db = new Database(dbPath);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        fullName TEXT,
        month TEXT,
        date TEXT,
        purpose TEXT,
        total REAL,
        refunded INTEGER DEFAULT 0
      )
    `);
    
    global._sqliteCache = db;
    console.log('🧠 [DB] SQLite Initialized at', dbPath);
  }
  return global._sqliteCache;
}
