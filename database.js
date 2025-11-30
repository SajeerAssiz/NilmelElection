const Database = require('better-sqlite3');
const path = require('path');

// Create database file
const db = new Database(path.join(__dirname, 'voters.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create voters table matching the actual data format
// Columns: Serial No., Name, Guardian's Name, OldWard No/ House No., House Name, Gender / Age, New SEC ID No.
db.exec(`
  CREATE TABLE IF NOT EXISTS voters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sl_no INTEGER,
    name TEXT NOT NULL,
    guardian_name TEXT,
    old_ward_no TEXT,
    house_no TEXT,
    house_name TEXT,
    gender TEXT,
    age INTEGER,
    sec_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create indexes for faster searches
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_voters_name ON voters(name);
  CREATE INDEX IF NOT EXISTS idx_voters_sec_id ON voters(sec_id);
  CREATE INDEX IF NOT EXISTS idx_voters_house_name ON voters(house_name);
  CREATE INDEX IF NOT EXISTS idx_voters_guardian ON voters(guardian_name);
`);

console.log('Database initialized successfully!');

module.exports = db;
