const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// ============ DASHBOARD API ============

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalVoters = db.prepare('SELECT COUNT(*) as count FROM voters WHERE is_active = 1').get().count;
    const voted = db.prepare('SELECT COUNT(*) as count FROM voters WHERE is_active = 1 AND has_voted = 1').get().count;
    const maleVoters = db.prepare("SELECT COUNT(*) as count FROM voters WHERE is_active = 1 AND gender = 'M'").get().count;
    const femaleVoters = db.prepare("SELECT COUNT(*) as count FROM voters WHERE is_active = 1 AND gender = 'F'").get().count;
    const totalWards = db.prepare('SELECT COUNT(*) as count FROM wards').get().count;
    const totalBooths = db.prepare('SELECT COUNT(*) as count FROM polling_stations').get().count;

    res.json({
      totalVoters,
      voted,
      notVoted: totalVoters - voted,
      maleVoters,
      femaleVoters,
      totalWards: totalWards || 23,
      totalBooths: totalBooths || 45,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/voters-by-ward', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT w.ward_no, w.ward_name, COUNT(v.id) as count
      FROM wards w
      LEFT JOIN polling_stations ps ON ps.ward_id = w.id
      LEFT JOIN voters v ON v.polling_station_id = ps.id AND v.is_active = 1
      GROUP BY w.id
      ORDER BY w.ward_no
    `).all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/voters-by-party', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT p.party_name as name, COUNT(v.id) as count
      FROM political_parties p
      LEFT JOIN voters v ON v.party_affiliation_id = p.id AND v.is_active = 1
      GROUP BY p.id
      ORDER BY count DESC
    `).all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/voting-progress', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM voters WHERE is_active = 1').get().count;
    const voted = db.prepare('SELECT COUNT(*) as count FROM voters WHERE is_active = 1 AND has_voted = 1').get().count;
    res.json({
      totalVoters: total,
      voted,
      notVoted: total - voted,
      percentage: total > 0 ? Math.round((voted / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ VOTERS API ============

app.get('/api/voters', (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', wardId = '', partyId = '', hasVoted = '', gender = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM voters WHERE is_active = 1';
    let countQuery = 'SELECT COUNT(*) as total FROM voters WHERE is_active = 1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR sec_id LIKE ? OR house_name LIKE ? OR guardian_name LIKE ? OR mobile_primary LIKE ?)';
      countQuery += ' AND (name LIKE ? OR sec_id LIKE ? OR house_name LIKE ? OR guardian_name LIKE ? OR mobile_primary LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (wardId) {
      query += ' AND polling_station_id IN (SELECT id FROM polling_stations WHERE ward_id = ?)';
      countQuery += ' AND polling_station_id IN (SELECT id FROM polling_stations WHERE ward_id = ?)';
      params.push(wardId);
    }

    if (partyId) {
      query += ' AND party_affiliation_id = ?';
      countQuery += ' AND party_affiliation_id = ?';
      params.push(partyId);
    }

    if (hasVoted !== '') {
      query += ' AND has_voted = ?';
      countQuery += ' AND has_voted = ?';
      params.push(hasVoted);
    }

    if (gender) {
      query += ' AND gender = ?';
      countQuery += ' AND gender = ?';
      params.push(gender);
    }

    query += ' ORDER BY sl_no ASC LIMIT ? OFFSET ?';

    const total = db.prepare(countQuery).get(...params).total;
    const voters = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));

    res.json({ voters, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voters/search', (req, res) => {
  try {
    const { search = '' } = req.query;
    if (!search) return res.json({ voters: [] });

    const voters = db.prepare(`
      SELECT * FROM voters
      WHERE is_active = 1
      AND (name LIKE ? OR sec_id LIKE ? OR house_name LIKE ? OR guardian_name LIKE ?)
      ORDER BY sl_no ASC LIMIT 50
    `).all(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);

    res.json({ voters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voters/:id', (req, res) => {
  try {
    const voter = db.prepare(`
      SELECT v.*,
        r.religion_name, c.caste_name, o.occupation_name, e.education_name,
        p.party_name, vp.category_name as probability_name
      FROM voters v
      LEFT JOIN religions r ON v.religion_id = r.id
      LEFT JOIN castes c ON v.caste_id = c.id
      LEFT JOIN occupations o ON v.occupation_id = o.id
      LEFT JOIN education_levels e ON v.education_id = e.id
      LEFT JOIN political_parties p ON v.party_affiliation_id = p.id
      LEFT JOIN vote_probability_categories vp ON v.vote_probability_id = vp.id
      WHERE v.id = ?
    `).get(req.params.id);

    if (!voter) return res.status(404).json({ error: 'Voter not found' });
    res.json(voter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voters', (req, res) => {
  try {
    const fields = Object.keys(req.body).filter(k => req.body[k] !== undefined && req.body[k] !== '');
    const values = fields.map(k => req.body[k]);
    const placeholders = fields.map(() => '?').join(', ');

    const stmt = db.prepare(`INSERT INTO voters (${fields.join(', ')}) VALUES (${placeholders})`);
    const result = stmt.run(...values);

    res.json({ id: result.lastInsertRowid, message: 'Voter created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/voters/:id', (req, res) => {
  try {
    const fields = Object.keys(req.body).filter(k => k !== 'id');
    const setClause = fields.map(k => `${k} = ?`).join(', ');
    const values = fields.map(k => req.body[k]);

    db.prepare(`UPDATE voters SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, req.params.id);
    res.json({ message: 'Voter updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/voters/:id', (req, res) => {
  try {
    db.prepare('UPDATE voters SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voters/:id/voted', (req, res) => {
  try {
    const { has_voted, voted_time } = req.body;
    db.prepare('UPDATE voters SET has_voted = ?, voted_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(has_voted, voted_time || new Date().toISOString(), req.params.id);
    res.json({ message: 'Voting status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ STATES API ============

app.get('/api/states', (req, res) => {
  try {
    const states = db.prepare('SELECT * FROM states WHERE is_active = 1 ORDER BY state_name').all();
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/states', (req, res) => {
  try {
    const { state_code, state_name, state_name_malayalam } = req.body;
    const result = db.prepare('INSERT INTO states (state_code, state_name, state_name_malayalam) VALUES (?, ?, ?)')
      .run(state_code, state_name, state_name_malayalam);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DISTRICTS API ============

app.get('/api/districts', (req, res) => {
  try {
    const { stateId } = req.query;
    let query = 'SELECT * FROM districts WHERE is_active = 1';
    const params = [];
    if (stateId) {
      query += ' AND state_id = ?';
      params.push(stateId);
    }
    query += ' ORDER BY district_name';
    res.json(db.prepare(query).all(...params));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/districts', (req, res) => {
  try {
    const { district_code, district_name, district_name_malayalam, state_id } = req.body;
    const result = db.prepare('INSERT INTO districts (district_code, district_name, district_name_malayalam, state_id) VALUES (?, ?, ?, ?)')
      .run(district_code, district_name, district_name_malayalam, state_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ LOCAL BODIES API ============

app.get('/api/local-bodies', (req, res) => {
  try {
    const { districtId } = req.query;
    let query = 'SELECT * FROM local_bodies WHERE is_active = 1';
    const params = [];
    if (districtId) {
      query += ' AND district_id = ?';
      params.push(districtId);
    }
    query += ' ORDER BY lb_name';
    res.json(db.prepare(query).all(...params));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/local-bodies', (req, res) => {
  try {
    const { lb_code, lb_name, lb_name_malayalam, lb_type, district_id } = req.body;
    const result = db.prepare('INSERT INTO local_bodies (lb_code, lb_name, lb_name_malayalam, lb_type, district_id) VALUES (?, ?, ?, ?, ?)')
      .run(lb_code, lb_name, lb_name_malayalam, lb_type, district_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WARDS API ============

app.get('/api/wards', (req, res) => {
  try {
    const { localBodyId } = req.query;
    let query = 'SELECT * FROM wards WHERE is_active = 1';
    const params = [];
    if (localBodyId) {
      query += ' AND local_body_id = ?';
      params.push(localBodyId);
    }
    query += ' ORDER BY ward_no';
    res.json(db.prepare(query).all(...params));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wards', (req, res) => {
  try {
    const { ward_no, ward_name, ward_name_malayalam, local_body_id } = req.body;
    const result = db.prepare('INSERT INTO wards (ward_no, ward_name, ward_name_malayalam, local_body_id) VALUES (?, ?, ?, ?)')
      .run(ward_no, ward_name, ward_name_malayalam, local_body_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ POLLING STATIONS API ============

app.get('/api/polling-stations', (req, res) => {
  try {
    const { wardId } = req.query;
    let query = 'SELECT * FROM polling_stations WHERE is_active = 1';
    const params = [];
    if (wardId) {
      query += ' AND ward_id = ?';
      params.push(wardId);
    }
    query += ' ORDER BY station_no';
    res.json(db.prepare(query).all(...params));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/polling-stations', (req, res) => {
  try {
    const { station_no, station_name, station_name_malayalam, address, ward_id } = req.body;
    const result = db.prepare('INSERT INTO polling_stations (station_no, station_name, station_name_malayalam, address, ward_id) VALUES (?, ?, ?, ?, ?)')
      .run(station_no, station_name, station_name_malayalam, address, ward_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ POLITICAL PARTIES API ============

app.get('/api/parties', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM political_parties WHERE is_active = 1 ORDER BY party_name').all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/parties', (req, res) => {
  try {
    const { party_code, party_name, party_name_malayalam, party_symbol, party_color, alliance } = req.body;
    const result = db.prepare('INSERT INTO political_parties (party_code, party_name, party_name_malayalam, party_symbol, party_color, alliance) VALUES (?, ?, ?, ?, ?, ?)')
      .run(party_code, party_name, party_name_malayalam, party_symbol, party_color, alliance);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ RELIGIONS API ============

app.get('/api/religions', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM religions WHERE is_active = 1 ORDER BY religion_name').all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/religions', (req, res) => {
  try {
    const { religion_code, religion_name, religion_name_malayalam } = req.body;
    const result = db.prepare('INSERT INTO religions (religion_code, religion_name, religion_name_malayalam) VALUES (?, ?, ?)')
      .run(religion_code, religion_name, religion_name_malayalam);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CASTES API ============

app.get('/api/castes', (req, res) => {
  try {
    const { religionId } = req.query;
    let query = 'SELECT c.*, r.religion_name FROM castes c LEFT JOIN religions r ON c.religion_id = r.id WHERE c.is_active = 1';
    const params = [];
    if (religionId) {
      query += ' AND c.religion_id = ?';
      params.push(religionId);
    }
    query += ' ORDER BY c.caste_name';
    res.json(db.prepare(query).all(...params));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/castes', (req, res) => {
  try {
    const { caste_code, caste_name, caste_name_malayalam, category, religion_id } = req.body;
    const result = db.prepare('INSERT INTO castes (caste_code, caste_name, caste_name_malayalam, category, religion_id) VALUES (?, ?, ?, ?, ?)')
      .run(caste_code, caste_name, caste_name_malayalam, category, religion_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ OCCUPATIONS API ============

app.get('/api/occupations', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM occupations WHERE is_active = 1 ORDER BY occupation_name').all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/occupations', (req, res) => {
  try {
    const { occupation_code, occupation_name, occupation_name_malayalam, occupation_category } = req.body;
    const result = db.prepare('INSERT INTO occupations (occupation_code, occupation_name, occupation_name_malayalam, occupation_category) VALUES (?, ?, ?, ?)')
      .run(occupation_code, occupation_name, occupation_name_malayalam, occupation_category);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EDUCATION LEVELS API ============

app.get('/api/education-levels', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM education_levels WHERE is_active = 1 ORDER BY education_name').all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/education-levels', (req, res) => {
  try {
    const { education_code, education_name, education_name_malayalam } = req.body;
    const result = db.prepare('INSERT INTO education_levels (education_code, education_name, education_name_malayalam) VALUES (?, ?, ?)')
      .run(education_code, education_name, education_name_malayalam);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ VOTE PROBABILITY API ============

app.get('/api/vote-probabilities', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM vote_probability_categories WHERE is_active = 1 ORDER BY sort_order').all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vote-probabilities', (req, res) => {
  try {
    const { category_code, category_name, category_name_malayalam, probability_percentage, color_code, sort_order } = req.body;
    const result = db.prepare('INSERT INTO vote_probability_categories (category_code, category_name, category_name_malayalam, probability_percentage, color_code, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
      .run(category_code, category_name, category_name_malayalam, probability_percentage, color_code, sort_order);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ELECTIONS API ============

app.get('/api/elections', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM elections WHERE is_active = 1 ORDER BY election_date DESC').all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/elections', (req, res) => {
  try {
    const { election_code, election_name, election_type, election_date, local_body_id } = req.body;
    const result = db.prepare('INSERT INTO elections (election_code, election_name, election_type, election_date, local_body_id) VALUES (?, ?, ?, ?, ?)')
      .run(election_code, election_name, election_type, election_date, local_body_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ IMPORT API ============

app.post('/api/voters/import', (req, res) => {
  try {
    const { voters } = req.body;
    if (!voters || !Array.isArray(voters)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const insert = db.prepare(`
      INSERT OR IGNORE INTO voters (sl_no, name, guardian_name, old_ward_no, house_no, house_name, gender, age, sec_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((voters) => {
      let imported = 0;
      for (const v of voters) {
        const result = insert.run(v.sl_no, v.name, v.guardian_name, v.old_ward_no, v.house_no, v.house_name, v.gender, v.age, v.sec_id);
        if (result.changes > 0) imported++;
      }
      return imported;
    });

    const imported = insertMany(voters);
    res.json({ message: `Successfully imported ${imported} voters`, imported });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
