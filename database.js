const Database = require('better-sqlite3');
const path = require('path');

// Create database file
const db = new Database(path.join(__dirname, 'voters.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================
// MASTER DATA TABLES - Panchayat Hierarchy
// State -> District -> Local Body -> Ward -> Polling Station -> Voters
// ============================================

// 1. States table
db.exec(`
  CREATE TABLE IF NOT EXISTS states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_code TEXT UNIQUE NOT NULL,
    state_name TEXT NOT NULL,
    state_name_malayalam TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 2. Districts table
db.exec(`
  CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_code TEXT UNIQUE NOT NULL,
    district_name TEXT NOT NULL,
    district_name_malayalam TEXT,
    state_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id)
  )
`);

// 3. Local Bodies table (Panchayat/Municipality/Corporation)
db.exec(`
  CREATE TABLE IF NOT EXISTS local_bodies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lb_code TEXT UNIQUE NOT NULL,
    lb_name TEXT NOT NULL,
    lb_name_malayalam TEXT,
    lb_type TEXT NOT NULL,
    district_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id)
  )
`);

// 4. Wards table
db.exec(`
  CREATE TABLE IF NOT EXISTS wards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ward_no INTEGER NOT NULL,
    ward_name TEXT NOT NULL,
    ward_name_malayalam TEXT,
    local_body_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (local_body_id) REFERENCES local_bodies(id),
    UNIQUE(ward_no, local_body_id)
  )
`);

// 5. Polling Stations table
db.exec(`
  CREATE TABLE IF NOT EXISTS polling_stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_no INTEGER NOT NULL,
    station_name TEXT NOT NULL,
    station_name_malayalam TEXT,
    address TEXT,
    ward_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(id),
    UNIQUE(station_no, ward_id)
  )
`);

// ============================================
// VOTERS TABLE - Links to Polling Station
// ============================================
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
    polling_station_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (polling_station_id) REFERENCES polling_stations(id)
  )
`);

// ============================================
// INDEXES for faster searches
// ============================================
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_voters_name ON voters(name);
  CREATE INDEX IF NOT EXISTS idx_voters_sec_id ON voters(sec_id);
  CREATE INDEX IF NOT EXISTS idx_voters_house_name ON voters(house_name);
  CREATE INDEX IF NOT EXISTS idx_voters_guardian ON voters(guardian_name);
  CREATE INDEX IF NOT EXISTS idx_voters_polling_station ON voters(polling_station_id);

  CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);
  CREATE INDEX IF NOT EXISTS idx_local_bodies_district ON local_bodies(district_id);
  CREATE INDEX IF NOT EXISTS idx_wards_local_body ON wards(local_body_id);
  CREATE INDEX IF NOT EXISTS idx_polling_stations_ward ON polling_stations(ward_id);
`);

console.log('Database initialized successfully!');

module.exports = db;
