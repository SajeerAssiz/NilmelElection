const Database = require('better-sqlite3');
const path = require('path');

// Create database file
const db = new Database(path.join(__dirname, 'voters.db'));

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create voters table
db.exec(`
  CREATE TABLE IF NOT EXISTS voters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sl_no INTEGER,
    voter_id TEXT UNIQUE,
    name TEXT NOT NULL,
    name_malayalam TEXT,
    guardian_name TEXT,
    guardian_name_malayalam TEXT,
    relationship TEXT,
    house_name TEXT,
    house_name_malayalam TEXT,
    house_number TEXT,
    age INTEGER,
    gender TEXT,
    ward_no INTEGER,
    booth_no INTEGER,
    booth_name TEXT,
    polling_station TEXT,
    epic_no TEXT,
    mobile TEXT,
    email TEXT,
    remarks TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create wards table
db.exec(`
  CREATE TABLE IF NOT EXISTS wards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ward_no INTEGER UNIQUE NOT NULL,
    ward_name TEXT NOT NULL,
    ward_name_malayalam TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create booths table
db.exec(`
  CREATE TABLE IF NOT EXISTS booths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booth_no INTEGER NOT NULL,
    booth_name TEXT NOT NULL,
    booth_name_malayalam TEXT,
    ward_no INTEGER,
    polling_station TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_no) REFERENCES wards(ward_no)
  )
`);

// Create index for faster searches
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_voters_name ON voters(name);
  CREATE INDEX IF NOT EXISTS idx_voters_ward ON voters(ward_no);
  CREATE INDEX IF NOT EXISTS idx_voters_booth ON voters(booth_no);
  CREATE INDEX IF NOT EXISTS idx_voters_voter_id ON voters(voter_id);
`);

console.log('Database initialized successfully!');

module.exports = db;
