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
// POLITICAL PARTIES MASTER TABLE
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS political_parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_code TEXT UNIQUE NOT NULL,
    party_name TEXT NOT NULL,
    party_name_malayalam TEXT,
    party_symbol TEXT,
    party_color TEXT,
    alliance TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ============================================
// DEMOGRAPHIC MASTER TABLES
// ============================================

// Religion Master
db.exec(`
  CREATE TABLE IF NOT EXISTS religions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    religion_code TEXT UNIQUE NOT NULL,
    religion_name TEXT NOT NULL,
    religion_name_malayalam TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Caste/Community Master
db.exec(`
  CREATE TABLE IF NOT EXISTS castes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caste_code TEXT UNIQUE NOT NULL,
    caste_name TEXT NOT NULL,
    caste_name_malayalam TEXT,
    category TEXT,
    religion_id INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (religion_id) REFERENCES religions(id)
  )
`);

// Occupation/Job Status Master
db.exec(`
  CREATE TABLE IF NOT EXISTS occupations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT UNIQUE NOT NULL,
    occupation_name TEXT NOT NULL,
    occupation_name_malayalam TEXT,
    occupation_category TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Education Level Master
db.exec(`
  CREATE TABLE IF NOT EXISTS education_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    education_code TEXT UNIQUE NOT NULL,
    education_name TEXT NOT NULL,
    education_name_malayalam TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Voting Probability Categories Master
db.exec(`
  CREATE TABLE IF NOT EXISTS vote_probability_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_code TEXT UNIQUE NOT NULL,
    category_name TEXT NOT NULL,
    category_name_malayalam TEXT,
    probability_percentage INTEGER,
    color_code TEXT,
    sort_order INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ============================================
// VOTERS TABLE - Comprehensive Voter Data
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS voters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Basic Information (from original data)
    sl_no INTEGER,
    name TEXT NOT NULL,
    name_malayalam TEXT,
    guardian_name TEXT,
    guardian_name_malayalam TEXT,
    relationship TEXT,
    old_ward_no TEXT,
    house_no TEXT,
    house_name TEXT,
    house_name_malayalam TEXT,
    gender TEXT,
    age INTEGER,
    date_of_birth DATE,
    sec_id TEXT UNIQUE,
    epic_no TEXT,

    -- Location Reference
    polling_station_id INTEGER,

    -- Contact Information
    mobile_primary TEXT,
    mobile_secondary TEXT,
    whatsapp_number TEXT,
    email TEXT,
    address TEXT,

    -- Demographic Information
    religion_id INTEGER,
    caste_id INTEGER,
    occupation_id INTEGER,
    education_id INTEGER,
    annual_income TEXT,

    -- Family Information
    family_id TEXT,
    is_family_head INTEGER DEFAULT 0,
    total_family_members INTEGER,

    -- Political Analysis
    party_affiliation_id INTEGER,
    vote_probability_id INTEGER,
    political_influence_level TEXT,
    is_party_member INTEGER DEFAULT 0,
    is_party_worker INTEGER DEFAULT 0,
    is_booth_agent INTEGER DEFAULT 0,

    -- Voting Status (for election day)
    has_voted INTEGER DEFAULT 0,
    voted_time DATETIME,
    voted_marked_by TEXT,

    -- Special Categories
    is_nri INTEGER DEFAULT 0,
    is_govt_employee INTEGER DEFAULT 0,
    is_pensioner INTEGER DEFAULT 0,
    is_physically_challenged INTEGER DEFAULT 0,
    is_senior_citizen INTEGER DEFAULT 0,
    needs_transport INTEGER DEFAULT 0,
    needs_assistance INTEGER DEFAULT 0,

    -- Additional Information
    blood_group TEXT,
    known_issues TEXT,
    remarks TEXT,
    photo_url TEXT,

    -- Status Flags
    is_active INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    verified_by TEXT,
    verified_date DATETIME,

    -- Audit Fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,

    -- Foreign Keys
    FOREIGN KEY (polling_station_id) REFERENCES polling_stations(id),
    FOREIGN KEY (religion_id) REFERENCES religions(id),
    FOREIGN KEY (caste_id) REFERENCES castes(id),
    FOREIGN KEY (occupation_id) REFERENCES occupations(id),
    FOREIGN KEY (education_id) REFERENCES education_levels(id),
    FOREIGN KEY (party_affiliation_id) REFERENCES political_parties(id),
    FOREIGN KEY (vote_probability_id) REFERENCES vote_probability_categories(id)
  )
`);

// ============================================
// VOTER INTERACTION HISTORY
// Track all interactions/updates with voters
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS voter_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voter_id INTEGER NOT NULL,
    interaction_type TEXT NOT NULL,
    interaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    outcome TEXT,
    next_action TEXT,
    next_action_date DATE,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voter_id) REFERENCES voters(id)
  )
`);

// ============================================
// ELECTION MASTER - For tracking multiple elections
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS elections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    election_code TEXT UNIQUE NOT NULL,
    election_name TEXT NOT NULL,
    election_type TEXT NOT NULL,
    election_date DATE,
    local_body_id INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (local_body_id) REFERENCES local_bodies(id)
  )
`);

// ============================================
// VOTING HISTORY - Track voting across elections
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS voting_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voter_id INTEGER NOT NULL,
    election_id INTEGER NOT NULL,
    has_voted INTEGER DEFAULT 0,
    voted_time DATETIME,
    marked_by TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voter_id) REFERENCES voters(id),
    FOREIGN KEY (election_id) REFERENCES elections(id),
    UNIQUE(voter_id, election_id)
  )
`);

// ============================================
// USERS TABLE - For application access
// ============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    role TEXT DEFAULT 'viewer',
    assigned_ward_id INTEGER,
    assigned_polling_station_id INTEGER,
    is_active INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_ward_id) REFERENCES wards(id),
    FOREIGN KEY (assigned_polling_station_id) REFERENCES polling_stations(id)
  )
`);

// ============================================
// INDEXES for faster searches
// ============================================
db.exec(`
  -- Voter indexes
  CREATE INDEX IF NOT EXISTS idx_voters_name ON voters(name);
  CREATE INDEX IF NOT EXISTS idx_voters_sec_id ON voters(sec_id);
  CREATE INDEX IF NOT EXISTS idx_voters_epic ON voters(epic_no);
  CREATE INDEX IF NOT EXISTS idx_voters_mobile ON voters(mobile_primary);
  CREATE INDEX IF NOT EXISTS idx_voters_house_name ON voters(house_name);
  CREATE INDEX IF NOT EXISTS idx_voters_guardian ON voters(guardian_name);
  CREATE INDEX IF NOT EXISTS idx_voters_polling_station ON voters(polling_station_id);
  CREATE INDEX IF NOT EXISTS idx_voters_party ON voters(party_affiliation_id);
  CREATE INDEX IF NOT EXISTS idx_voters_religion ON voters(religion_id);
  CREATE INDEX IF NOT EXISTS idx_voters_caste ON voters(caste_id);
  CREATE INDEX IF NOT EXISTS idx_voters_probability ON voters(vote_probability_id);
  CREATE INDEX IF NOT EXISTS idx_voters_voted ON voters(has_voted);
  CREATE INDEX IF NOT EXISTS idx_voters_family ON voters(family_id);

  -- Hierarchy indexes
  CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);
  CREATE INDEX IF NOT EXISTS idx_local_bodies_district ON local_bodies(district_id);
  CREATE INDEX IF NOT EXISTS idx_wards_local_body ON wards(local_body_id);
  CREATE INDEX IF NOT EXISTS idx_polling_stations_ward ON polling_stations(ward_id);

  -- Interaction indexes
  CREATE INDEX IF NOT EXISTS idx_interactions_voter ON voter_interactions(voter_id);
  CREATE INDEX IF NOT EXISTS idx_voting_history_voter ON voting_history(voter_id);
  CREATE INDEX IF NOT EXISTS idx_voting_history_election ON voting_history(election_id);
`);

console.log('Database initialized successfully!');

module.exports = db;
